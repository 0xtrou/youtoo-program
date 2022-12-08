import { PublicKey, TransactionInstruction } from '@solana/web3.js';
import { BN } from '@project-serum/anchor';

/**
 * @dev Import deps.
 */
import { ChallengeProgram, ProgramBuilder } from './program.builder';
import { PDAFinder } from './program.finder';
import { ChallengeProgramState } from './challenge.state';

/**
 * @dev `ChallengeInstructionBuilder` helps build the instruction that aligns with the business logic.
 */
export class ChallengeInstructionBuilder {
  /**
   * @dev Constructor initializes the challenge instruction builder.
   * @param programBuilder
   * @param program
   * @param pdaFinder
   * @param challengeState
   */
  constructor(
    private readonly programBuilder: ProgramBuilder,
    private readonly program: ChallengeProgram,
    private readonly pdaFinder: PDAFinder,
    private readonly challengeState: ChallengeProgramState,
  ) {}

  /**
   * @dev Initialize challenge
   */
  public async initializeChallengeRegistry(): Promise<
    TransactionInstruction[]
  > {
    const {
      address: [challengeRegistryPubkey],
    } = await this.pdaFinder.getChallengeRegistryAccount();

    /**
     * @dev return the  token vault creation instruction.
     */
    const instruction = await this.program.methods
      .initialize({
        allowedMintAccounts: [],
        allowedAdministrators: [],
      })
      .accounts({
        owner: this.program.provider.publicKey,
        challengeRegistry: challengeRegistryPubkey,
      })
      .instruction();

    /**
     * @dev Return the instruction
     */
    return [instruction];
  }

  /**
   * @dev Initialize challenge
   */
  public async updateChallengeRegistry(payload: {
    allowedAdministrators: PublicKey[];
  }): Promise<TransactionInstruction[]> {
    const {
      address: [challengeRegistryPubkey],
    } = await this.pdaFinder.getChallengeRegistryAccount();

    /**
     * @dev return the  token vault creation instruction.
     */
    const instruction = await this.program.methods
      .initialize({
        allowedMintAccounts: [],
        allowedAdministrators: payload.allowedAdministrators,
      })
      .accounts({
        owner: this.program.provider.publicKey,
        challengeRegistry: challengeRegistryPubkey,
      })
      .instruction();

    /**
     * @dev Return the instruction
     */
    return [instruction];
  }

  /**
   * @dev Create the token vault.
   * Need an authorized wallet connection from user wallet.
   * @param payload
   */
  public async createTokenVault(payload: {
    mintTokenAddress: string;
  }): Promise<TransactionInstruction[]> {
    /**
     * @dev Initializes account, the accounts can be empty when it's not initialized yet.
     */
    const {
      address: [challengeRegistryPubkey],
    } = await this.pdaFinder.getChallengeRegistryAccount();
    const {
      address: [tokenVaultPubkey],
      accountInfo,
    } = await this.pdaFinder.getTokenVaultAccount(payload.mintTokenAddress);
    const mintAccount = new PublicKey(payload.mintTokenAddress);

    /**
     * @dev The account was initialized, so we don't need this instruction.
     */
    if (!!accountInfo) {
      return [];
    }

    /**
     * @dev return the  token vault creation instruction.
     */
    const instruction = await this.program.methods
      .createTokenVault()
      .accounts({
        signer: this.program.provider.publicKey,
        mintAccount,
        challengeRegistry: challengeRegistryPubkey,
        challengeTokenVault: tokenVaultPubkey,
      })
      .instruction();

    /**
     * @dev Return the instruction
     */
    return [instruction];
  }

  /**
   * @dev Create a challenge with the pre-defined id and other params.
   * @param payload
   */
  public async createChallenge(payload: {
    challengeId: string;
    minDeposit: number;
    rewardMintAddress: string;
  }): Promise<TransactionInstruction[]> {
    /**
     * @dev Initialize the account addresses
     */
    const {
      address: [challengeRegistryPubkey],
    } = await this.pdaFinder.getChallengeRegistryAccount();

    const {
      address: [challengePubkey],
    } = await this.pdaFinder.getChallengeAccount(payload.challengeId);
    const mintAccount = new PublicKey(payload.rewardMintAddress);

    /**
     * @dev Build the instruction.
     */
    const instruction = await this.program.methods
      .createChallenge({
        rewardTokenMintAccount: mintAccount,
        id: payload.challengeId,
        minDeposit: new BN(payload.minDeposit),
      })
      .accounts({
        challengeOwner: this.program.provider.publicKey,
        challenge: challengePubkey,
        challengeRegistry: challengeRegistryPubkey,
      })
      .instruction();

    /**
     * @dev Return the instruction
     */
    return [instruction];
  }

  /**
   * @dev Cancel challenge.
   */
  public async cancelChallenge(payload: {
    challengeId: string;
  }): Promise<TransactionInstruction[]> {
    const {
      address: [challengePubkey],
    } = await this.pdaFinder.getChallengeAccount(payload.challengeId);

    /**
     * @dev Build the instruction.
     */
    const instruction = await this.program.methods
      .cancelChallenge({
        id: payload.challengeId,
      })
      .accounts({
        signer: this.program.provider.publicKey,
        challenge: challengePubkey,
      })
      .instruction();

    /**
     * @dev Return the instruction
     */
    return [instruction];
  }

  /**
   * @dev Submit winner list.
   */
  public async submitWinnerList(payload: {
    challengeId: string;
    winnerList: PublicKey[];
  }): Promise<TransactionInstruction[]> {
    /**
     * @dev Initialize the account addresses
     */
    const {
      address: [challengeRegistryPubkey],
    } = await this.pdaFinder.getChallengeRegistryAccount();
    const {
      address: [challengePubkey],
    } = await this.pdaFinder.getChallengeAccount(payload.challengeId);

    /**
     * @dev Build the instruction.
     */
    const instruction = await this.program.methods
      .submitWinnerList({
        id: payload.challengeId,
        winnerList: payload.winnerList,
      })
      .accounts({
        signer: this.program.provider.publicKey,
        challenge: challengePubkey,
        challengeRegistry: challengeRegistryPubkey,
      })
      .instruction();

    /**
     * @dev Return the instruction
     */
    return [instruction];
  }

  /**
   * @dev Join a challenge and deposit an amount of reward.
   * @param payload
   */
  public async joinChallenge(payload: {
    challengeId: string;
    amount: string;
  }): Promise<TransactionInstruction[]> {
    /**
     * @dev Initialize account addresses
     *
     */
    const [mintAccount] = await this.challengeState.getWhitelistedToken();
    const {
      address: [challengePubkey],
    } = await this.pdaFinder.getChallengeAccount(payload.challengeId);
    const {
      address: [challengeTokenVault, challengeTokenVaultBump],
    } = await this.pdaFinder.getTokenVaultAccount(mintAccount.toBase58());
    const {
      address: [signerTokenAccount],
    } = await this.pdaFinder.getTokenAccountOf(
      mintAccount,
      this.program.provider.publicKey,
    );

    /**
     * @dev Build the instruction.
     */
    const instruction = await this.program.methods
      // @ts-ignore
      .transferAssetsToVault({
        actionType: { joinChallenge: {} },
        challengeId: payload.challengeId,
        amount: payload.amount,
        challengeTokenVaultBump,
      })
      .accounts({
        signer: this.program.provider.publicKey,
        challenge: challengePubkey,
        challengeTokenVault,
        signerTokenAccount,
        mintAccount,
      })
      .instruction();

    /**
     * @dev Return the instruction
     */
    return [instruction];
  }

  /**
   * @dev Donate reward to a challenge.
   * @param payload
   */
  public async donateReward(payload: {
    challengeId: string;
    amount: string;
  }): Promise<TransactionInstruction[]> {
    /**
     * @dev Initialize account addresses
     */
    const [mintAccount] = await this.challengeState.getWhitelistedToken();
    const {
      address: [challengePubkey],
    } = await this.pdaFinder.getChallengeAccount(payload.challengeId);
    const {
      address: [challengeTokenVault, challengeTokenVaultBump],
    } = await this.pdaFinder.getTokenVaultAccount(mintAccount.toBase58());
    const {
      address: [signerTokenAccount],
    } = await this.pdaFinder.getTokenAccountOf(
      mintAccount,
      this.program.provider.publicKey,
    );

    /**
     * @dev Build the instruction.
     */
    const instruction = await this.program.methods
      // @ts-ignore
      .transferAssetsToVault({
        actionType: { donate: {} },
        challengeId: payload.challengeId,
        amount: payload.amount,
        challengeTokenVaultBump,
      })
      .accounts({
        signer: this.program.provider.publicKey,
        challenge: challengePubkey,
        challengeTokenVault,
        signerTokenAccount,
        mintAccount,
      })
      .instruction();

    /**
     * @dev Return the instruction
     */
    return [instruction];
  }
  //
  // /**
  //  * @dev Claim reward from a challenge
  //  * @param payload
  //  */
  // public async claimReward(payload: {
  //   challengeId: string;
  // }): Promise<TransactionInstruction[]> {}
  //
  // /**
  //  * @dev Claim reward from a challenge
  //  * @param payload
  //  */
  // public async withdrawDepositedReward(payload: {
  //   challengeId: string;
  // }): Promise<TransactionInstruction[]> {}
  //
  // /**
  //  * @dev Claim reward from a challenge
  //  * @param payload
  //  */
  // public async adminWithdrawDonatePool(payload: {
  //   challengeId: string;
  // }): Promise<TransactionInstruction[]> {}
}
