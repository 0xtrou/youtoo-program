use crate::*;
use std::borrow::{Borrow, BorrowMut};

#[derive(AnchorSerialize, AnchorDeserialize, Default, Clone, Debug, PartialEq)]
pub enum TransferAssetsFromVaultActionType {
    #[default]
    Claiming,
    Withdrawing,
    AdminWithdrawingDonatePool
}

#[derive(AnchorSerialize, AnchorDeserialize, Default, Clone, Debug, PartialEq)]
pub struct TransferAssetsFromVaultParams {
    pub challenge_token_vault_bump: u8,
    pub challenge_id: String,
    pub action_type: TransferAssetsFromVaultActionType,
}

#[derive(Accounts)]
#[instruction(params: TransferAssetsFromVaultParams)]
pub struct TransferAssetsFromVaultContext<'info> {
    #[account(mut)]
    pub signer: Signer<'info>,

    pub mint_account: Account<'info, Mint>,

    #[account(
    seeds = [PLATFORM_SEED],
    bump = challenge_registry.bump,
    )]
    pub challenge_registry: Account<'info, ChallengePlatformRegistry>,

    #[account(mut)]
    /// CHECK: the signer token account can be verified later
    pub signer_token_account: AccountInfo<'info>,

    #[account(
    mut,
    seeds = [CHALLENGE_SEED, params.challenge_id.as_bytes().as_ref()],
    bump = challenge.bump,
    )]
    pub challenge: Account<'info, Challenge>,

    #[account(
    mut,
    seeds = [TOKEN_ACCOUNT_SEED, mint_account.key().as_ref()],
    bump = params.challenge_token_vault_bump
    )]
    pub challenge_token_vault: Account<'info, TokenAccount>,

    #[account(address = system_program::ID)]
    pub system_program: Program<'info, System>,

    #[account(address = spl_token::ID)]
    pub token_program: Program<'info, Token>,
}

impl<'info> TransferAssetsFromVaultContext<'info> {
    pub fn execute(&mut self, params: TransferAssetsFromVaultParams) -> Result<()> {
        // Check and route for redeeming
        if params.action_type == TransferAssetsFromVaultActionType::Claiming {
            return self.claim(params);
        }

        // Check and route for withdrawal
        if params.action_type == TransferAssetsFromVaultActionType::Withdrawing {
            return self.withdraw(params);
        }

        // Check and route for withdrawal
        if params.action_type == TransferAssetsFromVaultActionType::AdminWithdrawingDonatePool {
            return self.admin_withdraw_donate_pool(params);
        }

        return Err(ChallengeError::InvalidValue.into());
    }

    fn claim(&mut self, params: TransferAssetsFromVaultParams) -> Result<()> {
        let current_params = params.clone();
        let challenge = self.challenge.borrow_mut();

        // check whether the challenge is still open for redeeming
        if !challenge.is_challenge_open_for_claim() {
            return Err(ChallengeError::ClaimIsNotAvailable.into());
        }

        // challenger is not the winner so we raise errors.
        if !challenge.is_winner(self.signer.key().clone()) {
            return Err(ChallengeError::ClaimIsNotAvailable.into());
        }

        let reward_amount = challenge.get_prize_for(
            self.signer.key()
        ).unwrap();

        // raise error if user already claimed reward
        if reward_amount == 0 {
            return Err(ChallengeError::ClaimIsNotAvailable.into());
        }

        // update claim status
        let player = challenge.find_player_for_mutation(self.signer.key()).unwrap();
        player.is_winner_claimed_reward = true;

        // find the bump to sign with the pda
        let bump = &[challenge.bump][..];
        let signer = token_account_signer!(
            PLATFORM_SEED,
            bump
        );

        // transfer the token
        token::transfer(
            CpiContext::new_with_signer(
                self.token_program.to_account_info(),
                Transfer {
                    from: self.challenge_token_vault.to_account_info(),
                    to: self.signer_token_account.to_account_info(),
                    authority: self.challenge_registry.to_account_info(),
                },
                signer,
            ),
            reward_amount,
        ).unwrap();

        // emit event
        challenge_emit!(
            RewardClaimed {
                actor: self.signer.key().clone(),
                challenge_key: challenge.key().clone(),
                amount: reward_amount,
                action_type: params.action_type,
                reward_mint_token: self.mint_account.key().clone(),
                challenge_id: challenge.id.clone(),
            }
        );

        if challenge.get_total_unclaimed_winners().unwrap() == 0 {
            challenge.status = ChallengeStatus::Claimed;
        }

        return Ok(());
    }

    fn withdraw(&mut self, params: TransferAssetsFromVaultParams) -> Result<()> {
        let current_params = params.clone();
        let challenge = self.challenge.borrow_mut();

        // check whether the challenge is still open for withdrawal
        if !challenge.is_challenge_open_for_withdrawal() {
            return Err(ChallengeError::WithdrawalIsNotAvailable.into());
        }

        // check whether the challenge is still open for withdrawal
        if !challenge.is_player(self.signer.key().clone()) {
            return Err(ChallengeError::WithdrawalIsNotAvailable.into());
        }

        // get withdrawal amount
        let withdrawal_amount = challenge.get_withdrawal_for(
            self.signer.key()
        ).unwrap();

        // raise error if play already withdrawn
        if withdrawal_amount == 0 {
            return Err(ChallengeError::WithdrawalIsNotAvailable.into());
        }

        // get player
        let player = challenge.find_player_for_mutation(
            self.signer.key()
        ).unwrap();
        player.is_player_withdrawn = true;

        // find the bump to sign with the pda
        let bump = &[challenge.bump][..];
        let signer = token_account_signer!(
            PLATFORM_SEED,
            bump
        );

        // transfer the token
        token::transfer(
            CpiContext::new_with_signer(
                self.token_program.to_account_info(),
                Transfer {
                    from: self.challenge_token_vault.to_account_info(),
                    to: self.signer_token_account.to_account_info(),
                    authority: self.challenge_registry.to_account_info(),
                },
                signer,
            ),
            withdrawal_amount,
        ).unwrap();

        // emit event
        challenge_emit!(
            RewardClaimed {
                actor: self.signer.key().clone(),
                challenge_key: challenge.key().clone(),
                amount: withdrawal_amount,
                action_type: params.action_type,
                reward_mint_token: self.mint_account.key().clone(),
                challenge_id: challenge.id.clone(),
            }
        );

        if challenge.get_total_unwithdrawn_player().unwrap() == 0 {
            challenge.status = ChallengeStatus::Withdrawn;
        }

        return Ok(());
    }

    fn admin_withdraw_donate_pool(&mut self, params: TransferAssetsFromVaultParams) -> Result<()> {
        // require administrator only
        if !self.challenge_registry.is_administrator(self.signer.key().clone()) {
            return Err(ChallengeError::OnlyAdministrator.into());
        }

        let current_params = params.clone();
        let challenge = self.challenge.borrow_mut();

        // get withdrawal amount
        let withdrawal_amount = challenge.donate_pool;

        // raise error if play already withdrawn
        if withdrawal_amount == 0 {
            return Err(ChallengeError::WithdrawalIsNotAvailable.into());
        }

        // find the bump to sign with the pda
        let bump = &[challenge.bump][..];
        let signer = token_account_signer!(
            PLATFORM_SEED,
            bump
        );

        // transfer the token
        token::transfer(
            CpiContext::new_with_signer(
                self.token_program.to_account_info(),
                Transfer {
                    from: self.challenge_token_vault.to_account_info(),
                    to: self.signer_token_account.to_account_info(),
                    authority: self.challenge_registry.to_account_info(),
                },
                signer,
            ),
            withdrawal_amount,
        ).unwrap();

        // exclude the withdrawn amount
        challenge.prize_pool -= withdrawal_amount;
        challenge.donate_pool = 0;

        // emit event
        challenge_emit!(
            RewardClaimed {
                actor: self.signer.key().clone(),
                challenge_key: challenge.key().clone(),
                amount: withdrawal_amount,
                action_type: params.action_type,
                reward_mint_token: self.mint_account.key().clone(),
                challenge_id: challenge.id.clone(),
            }
        );

        return Ok(());
    }
}