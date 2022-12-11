use crate::*;
use std::borrow::{Borrow, BorrowMut};
use anchor_spl::token::accessor::amount;

#[derive(AnchorSerialize, AnchorDeserialize, Default, Clone, Debug, PartialEq)]
pub enum TransferAssetsToVaultActionType {
    #[default]
    JoinChallenge,
    Donate
}

#[derive(AnchorSerialize, AnchorDeserialize, Default, Clone, Debug, PartialEq)]
pub struct TransferAssetsToVaultParams {
    pub challenge_token_vault_bump: u8,
    pub challenge_id: String,
    pub action_type: TransferAssetsToVaultActionType,
    pub amount: u64,
}

#[derive(Accounts)]
#[instruction(params: TransferAssetsToVaultParams)]
pub struct TransferAssetsToVaultContext<'info> {
    #[account(mut)]
    pub signer: Signer<'info>,

    pub mint_account: Account<'info, Mint>,

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

impl<'info> TransferAssetsToVaultContext<'info> {
    pub fn execute(&mut self, params: TransferAssetsToVaultParams) -> Result<()> {
        // Check and route for depositing
        if params.action_type == TransferAssetsToVaultActionType::JoinChallenge {
            return self.deposit(params);
        }

        // Check and route for fulfilling
        if params.action_type == TransferAssetsToVaultActionType::Donate {
            return self.donate(params);
        }

        return Err(ChallengeError::InvalidValue.into());
    }

    fn deposit(&mut self, params: TransferAssetsToVaultParams) -> Result<()> {
        let challenge = self.challenge.borrow_mut();
        let challenge_key = challenge.key().clone();

        // check whether the challenge is still open for depositing
        if !challenge.is_challenge_open_for_participants() {
            return Err(ChallengeError::DepositIsNotAvailable.into());
        }

        // check whether the amount reaches minimum deposit or not
        if params.amount < challenge.min_deposit {
            return Err(ChallengeError::MinDepositIsNotReached.into());
        }

        // transfer the token
        token::transfer(
            CpiContext::new(
                self.token_program.to_account_info(),
                Transfer {
                    from: self.signer_token_account.to_account_info(),
                    to: self.challenge_token_vault.to_account_info(),
                    authority: self.signer.to_account_info(),
                },
            ),
            params.amount,
        ).unwrap();

        // update the stats
        challenge.prize_pool += params.amount;

        // update player ticket
        let player = challenge.get_or_create_player(self.signer.key()).unwrap();
        player.total_deposit += params.amount;

        // emit event
        challenge_emit!(
            RewardReceived {
                actor: self.signer.key().clone(),
                amount: params.amount,
                challenge_key: challenge_key,
                action_type: params.action_type,
                reward_mint_token: self.mint_account.key().clone(),
                challenge_id: challenge.id.clone(),
            }
        );

        return Ok(());
    }

    fn donate(&mut self, params: TransferAssetsToVaultParams) -> Result<()> {
        let challenge = self.challenge.borrow_mut();
        let challenge_key = challenge.key().clone();

        // check whether the challenge is still open for depositing
        if !challenge.is_challenge_open_for_participants() {
            return Err(ChallengeError::DepositIsNotAvailable.into());
        }

        // transfer the token
        token::transfer(
            CpiContext::new(
                self.token_program.to_account_info(),
                Transfer {
                    from: self.signer_token_account.to_account_info(),
                    to: self.challenge_token_vault.to_account_info(),
                    authority: self.signer.to_account_info(),
                },
            ),
            params.amount,
        ).unwrap();

        // update the stats
        challenge.prize_pool += params.amount;
        challenge.donate_pool += params.amount;

        // emit event
        challenge_emit!(
            RewardReceived {
                actor: self.signer.key().clone(),
                amount: params.amount,
                challenge_key: challenge_key,
                action_type: params.action_type,
                reward_mint_token: self.mint_account.key().clone(),
                challenge_id: challenge.id.clone(),
            }
        );

        return Ok(());
    }

}