use crate::*;
use std::borrow::Borrow;

// ================ Swap Platform Config ================ //
// Here we define the account state that holds the administration info.
#[derive(AnchorSerialize, AnchorDeserialize, Default, Clone, Copy, Debug, PartialEq)]
pub struct MintInfo {
    // Whether the mint token is active or not.
    pub is_enabled: bool,
    pub bump: u8,
    pub mint_account: Pubkey,
    pub token_account: Pubkey,
}

#[account]
#[derive(Default)]
pub struct ChallengePlatformRegistry {
    // Define owner
    pub owner: Pubkey,

    // define whether the config was initialized or not, the contract must be only initialized once.
    pub was_initialized: bool,

    // Bump to help define the PDA of swap account
    pub bump: u8,

    // Define allowed administrators
    pub allowed_administrators: Vec<Pubkey>,

    // define whitelisted mint token account
    pub allowed_mint_accounts: Vec<MintInfo>,
}

// Define handler
impl ChallengePlatformRegistry {
    // handle data integrity after initialization
    pub fn handle_post_initialized(&mut self) -> Result<()> {
        if self.was_initialized == false {
            self.was_initialized = true;
            return Ok(());
        }

        msg!("ERROR::PLATFORM::ALREADY_INITIALIZED");
        return Err(ChallengeError::AlreadyInitialized.into());
    }

    // Check whether the mint account was previously added or not.
    pub fn is_mint_account_existed(&self, mint_account: Pubkey) -> bool {
        return self.allowed_mint_accounts.iter()
            .map(|allowed_mint_account| allowed_mint_account.mint_account)
            .filter(|&mint_account_key| mint_account_key == mint_account.key().clone())
            .count() >= 1;
    }

    // Check whether the mint account was enabled or not
    pub fn is_mint_account_enabled(&self, mint_account: Pubkey) -> bool {
        return self.allowed_mint_accounts.iter()
            .filter(|&mint_info|
                mint_info.mint_account == mint_account.key().clone()
                    && mint_info.is_enabled == true
            )
            .count() >= 1;
    }

    // Get mint info
    pub fn get_mint_info(&self, mint_account: Pubkey) -> &MintInfo {
        return self.allowed_mint_accounts.iter()
            .find(|&mint_account_key| mint_account_key.mint_account == mint_account.key().clone())
            .unwrap()
            .borrow();
    }

    // Define whether the signer is a winner
    pub fn is_administrator(&self, signer: Pubkey) -> bool {
        return self.owner.clone().key() == signer ||
            return self.allowed_administrators.clone()
                .into_iter()
                .filter(|admin_pubkey| admin_pubkey.clone() == signer)
                .count() == 1;
    }
}

// ================ Swap Option Interface ================ //
#[derive(AnchorSerialize, AnchorDeserialize, Default, Clone, Copy, Debug, PartialEq)]
pub enum ChallengeStatus {
    // Declare that the challenge is created
    #[default]
    Created,

    // Declare that the challenge is finalized
    Finalized,

    // Declare that the challenge is canceled
    Canceled,

    // Declare that the challenge is claimed.
    Claimed,

    // Declare that the challenge is withdrawn.
    Withdrawn,
}

#[derive(AnchorSerialize, AnchorDeserialize, Default, Clone, Copy, Debug, PartialEq)]
pub struct PlayerInfo {
    pub public_key: Pubkey,
    pub total_deposit: u64,
    pub is_winner: bool,
    pub is_winner_claimed_reward: bool,
    pub is_player_withdrawn: bool,
}

// Here we define the account state that holds the swap order. SwapOrder will be the PDA.
#[account]
#[derive(Default)]
pub struct Challenge {
    // Id of the challenge
    pub id: String,

    // Bump to help define the PDA of challenge.
    pub bump: u8,

    // Define the owner of the challenge
    pub owner: Pubkey,

    // Define minimum deposit
    pub min_deposit: u64,

    // Define the player list
    pub players: Vec<PlayerInfo>,

    // Define the current reward pool
    pub prize_pool: u64,

    // Define the donate pool
    pub donate_pool: u64,

    // Define the reward token
    pub reward_token_mint_account: Pubkey,

    // Define the challenge status
    pub status: ChallengeStatus,
}

// Implement some domain logic
impl Challenge {
    // Define default value
    pub fn default() -> Challenge {
        Challenge {
            bump: 0,
            id: String::default(),
            owner: Pubkey::default(),
            status: ChallengeStatus::Created,
            players: vec![],
            reward_token_mint_account: Pubkey::default(),
            min_deposit: 0,
            prize_pool: 0,
            donate_pool: 0
        }
    }

    // Define the state that the challenge is still open for participants.
    pub fn is_challenge_open_for_participants(&self) -> bool {
        return self.status == ChallengeStatus::Created; // need to be updated once depositing occurs
    }

    // Define the state that the challenge is still open for participants.
    pub fn is_challenge_open_for_claim(&self) -> bool {
        return self.status == ChallengeStatus::Finalized; // need to be updated once depositing occurs
    }

    // Define the state that the challenge is still open for participants.
    pub fn is_challenge_open_for_withdrawal(&self) -> bool {
        return self.status == ChallengeStatus::Canceled; // need to be updated once depositing occurs
    }

    // Define whether the challenge can be canceled for a pubkey.
    pub fn is_challenge_cancelable_for(&self, signer: &Pubkey) -> bool {
        return self.is_challenge_open_for_participants()
            && self.is_challenge_owner(signer.clone());
    }

    // find player for mutation
    pub fn get_or_create_player(&mut self, pub_key: Pubkey) -> Result<&mut PlayerInfo> {
        if !self.is_player(pub_key) {
            self.add_player(pub_key, 0).unwrap();
        }

        return self.find_player_for_mutation(pub_key);
    }

    // add player
    pub fn add_player(&mut self, pub_key: Pubkey, total_deposit: u64) -> Result<()> {
        if self.is_player(pub_key) {
            return Err(ChallengeError::AlreadyParticipated.into());
        }

        self.players.push(
            PlayerInfo {
                public_key: pub_key,
                is_winner_claimed_reward: false,
                is_winner: false,
                total_deposit,
                is_player_withdrawn: false,
            }
        );

        return Ok(());
    }

    // mutate player
    pub fn mutate_player(&mut self, player: PlayerInfo) -> Result<()> {
        let player = &player;

        if !self.is_player(player.public_key.clone()) {
            return Err(ChallengeError::OnlyParticipant.into());
        }

        // find player and then update the info
        let existed_player = self.find_player_for_mutation(player.public_key).unwrap();

        existed_player.total_deposit = player.total_deposit;
        existed_player.is_winner = player.is_winner;
        existed_player.is_winner_claimed_reward = player.is_winner_claimed_reward;

        return Ok(());
    }


    // Check whether the challenge owner is the signer.
    pub fn is_challenge_owner(&self, signer: Pubkey) -> bool {
        return self.owner == signer.key().clone();
    }


    // Define whether the signer is a player
    pub fn is_player(&self, signer: Pubkey) -> bool {
        return self.players.clone()
            .into_iter()
            .filter(|winner| winner.public_key == signer)
            .count() == 1;
    }

    // Define whether the signer is a player
    pub fn find_player_for_mutation(&mut self, player: Pubkey) -> Result<&mut PlayerInfo> {
        let player = self.players
            .iter_mut()
            .find(|pl| pl.public_key.clone() == player.clone())
            .unwrap();

        return Ok(player);
    }

    // Define whether the signer is a winner
    pub fn is_winner(&self, signer: Pubkey) -> bool {
        return self.players.clone()
            .into_iter()
            .filter(|player| (player.public_key == signer && player.is_winner == true))
            .count() == 1;
    }

    // Define the method to get total winners that claimed reward
    pub fn get_total_unclaimed_winners(&self) -> Result<u64> {
        return Ok(self.players.clone()
            .into_iter()
            .filter(|player| player.is_winner == true && !player.is_winner_claimed_reward == true)
            .count() as u64
        );
    }

    // Define the method to get total winners that claimed reward
    pub fn get_total_unwithdrawn_player(&self) -> Result<u64> {
        return Ok(self.players.clone()
            .into_iter()
            .filter(|player| player.is_player_withdrawn == false)
            .count() as u64
        );
    }

    // Define the function to get prize for signer
    pub fn get_prize_for(&self, signer: Pubkey) -> Result<u64> {
        let player = self.players.clone()
            .into_iter()
            .find(|player| player.public_key == signer && player.is_winner == true)
            .unwrap();

        if player.is_winner_claimed_reward {
            return Ok(0);
        }

        let total_winners = self.players.clone()
            .into_iter()
            .filter(|player| player.is_winner == true)
            .count();

        return Ok(self.prize_pool / total_winners as u64);
    }

    // Define the function to get prize for signer
    pub fn get_withdrawal_for(&self, signer: Pubkey) -> Result<u64> {
        let player = self.players.clone()
            .into_iter()
            .find(|player| player.public_key == signer)
            .unwrap();

        if player.is_player_withdrawn {
            return Ok(0);
        }

        return Ok(player.total_deposit);
    }
}