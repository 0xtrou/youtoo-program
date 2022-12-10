use crate::*;

// Define params
#[derive(AnchorSerialize, AnchorDeserialize, Default, Clone, Debug, PartialEq)]
pub struct UpdateChallengePlatformParams {
    // define max item can be traded.
    pub allowed_mint_accounts: Vec<MintInfo>,

    // define max allowed options can be asked.
    pub allowed_administrators: Vec<Pubkey>,
}

// Define the context, passed in parameters when trigger from deployer.
#[derive(Accounts)]
pub struct UpdateChallengePlatformContext<'info> {
    // We define the fee payer
    #[account(mut)]
    pub owner: Signer<'info>,

    #[account(
        mut,
        seeds = [PLATFORM_SEED],
        bump = challenge_registry.bump,
    )]
    pub challenge_registry: Account<'info, ChallengePlatformRegistry>,

    #[account(address = system_program::ID)]
    pub system_program: Program<'info, System>,
}

// implement the handler
impl<'info> UpdateChallengePlatformContext<'info> {
    pub fn execute(&mut self, params: UpdateChallengePlatformParams) -> Result<()> {
        // must be one of the administrators
        if !self.challenge_registry.is_administrator(self.owner.key()) {
            return Err(ChallengeError::OnlyAdministrator.into());
        }

        // Assigning values
        let challenge_registry = &mut self.challenge_registry;
        challenge_registry.allowed_administrators = params.allowed_administrators.clone();
        challenge_registry.allowed_mint_accounts = params.allowed_mint_accounts.clone();

        // emit event
        challenge_emit!(
            ChallengeRegistryUpdated {
                actor: self.owner.key().clone(),
                allowed_administrators: params.allowed_administrators.clone(),
                allowed_mint_accounts: params.allowed_mint_accounts.clone(),
            }
        );

        Ok(())
    }
}
