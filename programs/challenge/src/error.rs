use crate::*;

#[error_code]
pub enum ChallengeError {
    // System error
    #[msg("The program was already initialized")]
    AlreadyInitialized,
    #[msg("The mint account was existed")]
    MintAccountExisted,
    // Business errors
    #[msg("Only Platform Admin")]
    OnlyAdministrator,
    #[msg("Only Owner")]
    OnlyOwner,    #[msg("Order expired")]
    OrderExpired,
    #[msg("Invalid Offer")]
    InvalidOffer,
    #[msg("Invalid value")]
    InvalidValue,
    #[msg("Invalid value")]
    UnAllowedMintToken,
    #[msg("Challenge cannot be canceled")]
    ChallengeCannotBeCanceled,
    #[msg("Withdrawal is not available for the challenge")]
    WithdrawalIsNotAvailable,
    #[msg("Claim is not available for the challenge")]
    ClaimIsNotAvailable,
    #[msg("Transfer token from vault is not available for the challenge")]
    TransferTokenFromVaultIsNotAvailable,
    #[msg("Deposit is not available for the challenge")]
    DepositIsNotAvailable,
    #[msg("Only participants can execute this operation")]
    OnlyParticipant,
    #[msg("The participant already participated in the challenge.")]
    AlreadyParticipated,
    #[msg("Min deposit amount is not reached")]
    MinDepositIsNotReached,
}
