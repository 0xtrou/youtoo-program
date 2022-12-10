use crate::*;

#[derive(Accounts)]
pub struct CreateTokenVaultContext<'info> {
    #[account(mut)]
    pub signer: Signer<'info>,

    #[account(
        mut,
        seeds = [PLATFORM_SEED],
        bump = challenge_registry.bump,
    )]
    pub challenge_registry: Account<'info, ChallengePlatformRegistry>,

    pub mint_account: Account<'info, Mint>,

    #[account(init,
        token::mint = mint_account,
        token::authority = challenge_registry,
        seeds = [TOKEN_ACCOUNT_SEED, mint_account.key().as_ref()],
        payer = signer,
        bump
    )]
    pub challenge_token_vault: Account<'info, TokenAccount>,

    #[account(address = system_program::ID)]
    pub system_program: Program<'info, System>,

    #[account(address = spl_token::ID)]
    pub token_program: Program<'info, Token>,

    #[account(address = sysvar::rent::ID)]
    pub rent: Sysvar<'info, Rent>,
}

impl<'info> CreateTokenVaultContext<'info> {
    pub fn execute(&mut self, bump: u8) -> Result<()> {
        // must be one of the administrators
        if !self.challenge_registry.is_administrator(self.signer.key()) {
            return Err(ChallengeError::OnlyAdministrator.into());
        }

        // Avoid adding duplicated value
        if self.challenge_registry.is_mint_account_existed(self.mint_account.key().clone()) {
            return Err(ChallengeError::MintAccountExisted.into());
        }

        // Now we push into the allowed mint tokens array.
        self.challenge_registry.allowed_mint_accounts.push(
            MintInfo {
                bump,
                mint_account: self.mint_account.key().clone(),
                token_account: self.challenge_token_vault.key(),
                is_enabled: true
            }
        );

        // emit event
        challenge_emit!(
            VaultCreated {
                actor: self.signer.key().clone(),
                authority: self.challenge_registry.key().clone(),
                associated_account: self.challenge_token_vault.key().clone(),
                mint_account: self.mint_account.key().clone()
            }
        );

        Ok(())
    }
}