use crate::*;

// Define params
#[derive(AnchorSerialize, AnchorDeserialize, Default, Clone, Debug, PartialEq)]
pub struct InitializeChallengePlatformParams {
    // define max item can be traded.
    pub allowed_mint_accounts: Vec<MintInfo>,

    // define max allowed options can be asked.
    pub allowed_administrators: Vec<Pubkey>,
}

// Define the context, passed in parameters when trigger from deployer.
#[derive(Accounts)]
pub struct InitializeChallengePlatformContext<'info> {
    // We define the fee payer
    #[account(mut)]
    pub owner: Signer<'info>,

    #[account(
        init,
        seeds = [PLATFORM_SEED],
        payer = owner,
        space = 10240,
        bump
    )]
    pub challenge_registry: Account<'info, ChallengePlatformRegistry>,

    #[account(address = system_program::ID)]
    pub system_program: Program<'info, System>,
}

// implement the handler
impl<'info> InitializeChallengePlatformContext<'info> {
    pub fn execute(&mut self, params: InitializeChallengePlatformParams, bump: u8) -> Result<()> {
        // Handle post initialization
        self.challenge_registry.handle_post_initialized().unwrap();

        // Assigning values
        let challenge_registry = &mut self.challenge_registry;
        challenge_registry.bump = bump;
        challenge_registry.owner = *self.owner.key;
        challenge_registry.allowed_mint_accounts = params.allowed_mint_accounts;
        challenge_registry.allowed_administrators = params.allowed_administrators;

        Ok(())
    }
}
