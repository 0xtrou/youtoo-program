//! Events emitted.
use crate::*;

// Log to Program Log with a prologue so transaction scraper knows following line is valid mango log
#[macro_export]
macro_rules! challenge_emit {
    ($e:expr) => {
        msg!("challenge-log");
        emit!($e);
    };
}

/// Emitted when a [ChallengeRegistryUpdated] is created.
#[event]
pub struct ChallengeRegistryUpdated {
    #[index]
    pub actor: Pubkey,
    // Define allowed administrators
    pub allowed_administrators: Vec<Pubkey>,
    // define whitelisted mint token account
    pub allowed_mint_accounts: Vec<MintInfo>,
}


/// Emitted when a [VaultCreated] is created.
#[event]
pub struct VaultCreated {
    #[index]
    pub actor: Pubkey,
    #[index]
    pub authority: Pubkey,
    #[index]
    pub mint_account: Pubkey,
    #[index]
    pub associated_account: Pubkey,
}

/// Emitted when a [ChallengeCreated] is created.
#[event]
pub struct ChallengeCreated {
    #[index]
    pub actor: Pubkey,
    #[index]
    pub challenge_key: Pubkey,
    #[index]
    pub id: String,
}


/// Emitted when a [ChallengeFinalized] is created.
#[event]
pub struct ChallengeFinalized {
    #[index]
    pub actor: Pubkey,
    #[index]
    pub challenge_key: Pubkey,
    #[index]
    pub id: String,
    pub status: ChallengeStatus,
}

/// Emitted when a [ChallengeCanceled] is created.
#[event]
pub struct ChallengeCanceled {
    #[index]
    pub actor: Pubkey,
    #[index]
    pub challenge_key: Pubkey,
    #[index]
    pub id: String,
    pub status: ChallengeStatus,
}

/// Emitted when a [RewardReceived] is created.
#[event]
pub struct RewardReceived {
    #[index]
    pub actor: Pubkey,
    #[index]
    pub challenge_key: Pubkey,
    #[index]
    pub challenge_id: String,
    #[index]
    pub reward_mint_token: Pubkey,
    pub action_type: TransferAssetsToVaultActionType,
    pub amount: u64,
}

/// Emitted when a [RewardClaimed] is created.
#[event]
pub struct RewardClaimed {
    #[index]
    pub actor: Pubkey,
    #[index]
    pub challenge_key: Pubkey,
    #[index]
    pub challenge_id: String,
    #[index]
    pub reward_mint_token: Pubkey,
    pub action_type: TransferAssetsFromVaultActionType,
    pub amount: u64,
}
