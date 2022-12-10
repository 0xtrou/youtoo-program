use crate::*;

// Define params
#[derive(AnchorSerialize, AnchorDeserialize, Default, Clone, Debug, PartialEq)]
pub struct CreateChallengeParams {
    // offchain id used as a ref
    pub id: String,

    // define expiry date
    pub min_deposit: u64,

    // define the mint account for reward
    pub reward_token_mint_account: Pubkey
}

// Define the context, passed in parameters when trigger from deployer.
#[derive(Accounts)]
#[instruction(params: CreateChallengeParams)]
pub struct CreateChallengeContext<'info> {
    // We define the fee payer
    #[account(mut)]
    pub challenge_owner: Signer<'info>,

    #[account(
        init,
        seeds = [CHALLENGE_SEED, params.id.as_bytes().as_ref()],
        payer = challenge_owner,
        space = 10240,
        bump
    )]
    pub challenge: Account<'info, Challenge>,

    #[account(
        seeds = [PLATFORM_SEED],
        bump = challenge_registry.bump,
    )]
    pub challenge_registry: Account<'info, ChallengePlatformRegistry>,

    #[account(address = system_program::ID)]
    pub system_program: Program<'info, System>,
}

impl<'info> CreateChallengeContext<'info> {
    pub fn execute(&mut self, params: CreateChallengeParams, bump: u8) -> Result<()> {
        // set data
        let challenge = &mut self.challenge;
        challenge.owner = *self.challenge_owner.key;
        challenge.id = params.id;
        challenge.min_deposit = params.min_deposit;
        challenge.reward_token_mint_account = params.reward_token_mint_account;
        challenge.bump = bump;
        challenge.status = ChallengeStatus::Created;

        // Now to validate data state
        self.handle_post_initialized().unwrap();

        challenge_emit!(
          ChallengeCreated {
                id: self.challenge.id.to_string(),
                challenge_key: self.challenge.key().clone(),
                actor: self.challenge.owner.clone()
            }
        );

        // ok
        Ok(())
    }

    // validate mint account
    fn validate_mint_account(&self) -> Result<()> {
        if !self.challenge_registry.is_mint_account_enabled(self.challenge.reward_token_mint_account) {
            return Err(ChallengeError::UnAllowedMintToken.into());
        }

        return Ok(());
    }

    fn handle_post_initialized(&mut self) -> Result<()> {
        if self.challenge.id == "".to_string() {
            return Err(ChallengeError::InvalidValue.into());
        }

        if self.challenge.bump == 0 {
            return Err(ChallengeError::InvalidValue.into());
        }

        if self.challenge.owner == Pubkey::default() {
            return Err(ChallengeError::InvalidValue.into());
        }

        // Check if user want to offer un-allowed mint tokens
        self.validate_mint_account().unwrap();

        // ok
        return Ok(());
    }
}