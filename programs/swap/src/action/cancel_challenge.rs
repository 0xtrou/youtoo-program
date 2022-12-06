use crate::*;

#[derive(AnchorSerialize, AnchorDeserialize, Default, Clone, Debug, PartialEq)]
pub struct CancelChallengeParams {
    id: String
}

// Define the context, passed in parameters when trigger from deployer.
#[derive(Accounts)]
#[instruction(params: CancelChallengeParams)]
pub struct CancelChallengeContext<'info> {
    // We define the fee payer
    #[account(mut)]
    pub signer: Signer<'info>,

    #[account(
        seeds = [PLATFORM_SEED],
        bump = challenge_registry.bump,
    )]
    pub challenge_registry: Account<'info, ChallengePlatformRegistry>,

    #[account(
        mut,
        seeds = [CHALLENGE_SEED, params.id.as_bytes().as_ref()],
        bump = challenge.bump,
    )]
    pub challenge: Account<'info, Challenge>,

    #[account(address = system_program::ID)]
    pub system_program: Program<'info, System>,
}

impl<'info> CancelChallengeContext<'info> {
    pub fn execute(&mut self, params: CancelChallengeParams) -> Result<()> {
        // require administrator permission
        if !self.challenge_registry.is_administrator(self.signer.key().clone()) {
            return Err(ChallengeError::OnlyAdministrator.into());
        }

        // check if the challenge can be canceled
        if self.challenge.is_challenge_cancelable_for(&self.signer.key) {
            self.challenge.status = ChallengeStatus::Canceled;
            return Ok(());
        }

        // emit event
        challenge_emit!({
           ChallengeCanceled {
                actor: self.challenge.owner.key().clone(),
                status: ChallengeStatus::Canceled,
                id: self.challenge.id.clone(),
                challenge_key: self.challenge.key().clone(),
            }
        });

        // ok
        return Err(ChallengeError::ChallengeCannotBeCanceled.into());
    }

}