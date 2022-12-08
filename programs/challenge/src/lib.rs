use anchor_lang::prelude::*;
use anchor_lang::solana_program::{system_program, sysvar};
use anchor_spl::token::{self, Mint, Token, TokenAccount, Transfer};

use arrayref::array_ref;

pub mod action;
pub mod error;
pub mod event;
pub mod state;
pub mod constants;
pub mod macros;

pub use action::*;
pub use constants::*;
pub use error::*;
pub use state::*;
pub use event::*;
pub use macros::*;

declare_id!("Cza3vL3BhRPZAbvPhz6sT27UDxP1yhcnSqDM3CpR6Zmq");

#[program]
pub mod challenge {
    use super::*;

    // Initialize contract once
    pub fn initialize(
        ctx: Context<InitializeChallengePlatformContext>,
        params: InitializeChallengePlatformParams,
    ) -> Result<()> {
        // process
        ctx.accounts.execute(
            params,
            *ctx.bumps.get("challenge_registry").unwrap(),
        ).unwrap();

        // Program result should be ok.
        Ok(())
    }

    // Deployer can update swap config later
    pub fn update_challenge_registry(
        ctx: Context<UpdateChallengePlatformContext>,
        params: UpdateChallengePlatformParams
    ) -> Result<()> {
        // execute with context
        ctx.accounts.execute(params).unwrap();

        // Program result should be ok.
        Ok(())
    }

    // Create challenge, public to anyone
    pub fn create_token_vault(
        ctx: Context<CreateTokenVaultContext>
    ) -> Result<()> {
        ctx.accounts.execute(
            *ctx.bumps.get("challenge_token_vault").unwrap(),
        ).unwrap();

        Ok(())
    }

    // Create challenge, public to anyone
    pub fn create_challenge(
        ctx: Context<CreateChallengeContext>,
        params: CreateChallengeParams
    ) -> Result<()> {
        ctx.accounts.execute(
            params,
            *ctx.bumps.get("challenge").unwrap(),
        ).unwrap();

        Ok(())
    }

    // Create challenge, public to anyone
    pub fn cancel_challenge(
        ctx: Context<CancelChallengeContext>,
        params: CancelChallengeParams
    ) -> Result<()> {
        ctx.accounts.execute(params).unwrap();
        Ok(())
    }

    // Deposit or fulfilling the challenge
    pub fn transfer_assets_to_vault(
        ctx: Context<TransferAssetsToVaultContext>,
        params: TransferAssetsToVaultParams
    ) -> Result<()> {
        ctx.accounts.execute(params).unwrap();

        Ok(())
    }

    // Withdrawing or redeeming the challenge
    pub fn transfer_assets_from_vault(
        ctx: Context<TransferAssetsFromVaultContext>,
        params: TransferAssetsFromVaultParams
    ) -> Result<()> {
        ctx.accounts.execute(params).unwrap();

        Ok(())
    }

    // Withdrawing or redeeming the challenge
    pub fn submit_winner_list(
        ctx: Context<SubmitWinnersContext>,
        params: SubmitWinnersParams
    ) -> Result<()> {
        ctx.accounts.execute(params).unwrap();

        Ok(())
    }
}