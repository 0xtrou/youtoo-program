use crate::*;

#[derive(AnchorSerialize, AnchorDeserialize, Default, Clone, Debug, PartialEq)]
pub struct SubmitWinnersParams {
    id: String,
    winner_list: Vec<Pubkey>
}

// Define the context, passed in parameters when trigger from deployer.
#[derive(Accounts)]
#[instruction(params: SubmitWinnersParams)]
pub struct SubmitWinnersContext<'info> {
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

impl<'info> SubmitWinnersContext<'info> {
    pub fn execute(&mut self, params: SubmitWinnersParams) -> Result<()> {
        let challenge = &mut self.challenge;

        // require administrator permission or challenge owner
        if !(
            self.challenge_registry.is_administrator(self.signer.key().clone())
            || challenge.is_challenge_owner(self.signer.key().clone())
        ) {
            return Err(ChallengeError::InvalidValue.into());
        }

        // must be open for participants first
        if !challenge.is_challenge_open_for_participants() {
            return Err(ChallengeError::InvalidValue.into());
        }

        // now we mutate the winner list
        params.winner_list.into_iter().for_each(|winner| {
            let player = challenge.find_player_for_mutation(
                winner
            ).unwrap();

            player.is_winner = true;
        });

        // the challenge status now be updated into finalized
        challenge.status = ChallengeStatus::Finalized;

        return Ok(());
    }

}