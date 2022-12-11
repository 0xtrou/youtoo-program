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
    signer: PublicKey;
  }): Promise<TransactionInstruction[]> {
    const {
      address: [challengeRegistryPubkey],
    } = await this.pdaFinder.getChallengeRegistryAccount();

    /**
     * @dev return the  token vault creation instruction.
     */
    const instruction = await this.program.methods
      .updateChallengeRegistry({
        allowedMintAccounts: [],
        allowedAdministrators: payload.allowedAdministrators,
      })
      .accounts({
        owner: payload.signer,
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
    signer: PublicKey;
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
        signer: payload.signer,
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
    minDeposit: BN;
    rewardMintAddress: string;
    signer: PublicKey;
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
        minDeposit: payload.minDeposit,
      })
      .accounts({
        challengeOwner: payload.signer,
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
    signer: PublicKey;
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
        signer: payload.signer,
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
    signer: PublicKey;
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
        signer: payload.signer,
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
   * @dev build instruction
   * @param payload
   */
  private async transferAssetsFromVault(payload: {
    challengeId: string;
    actionType: Record<string, any>;
    signer: PublicKey;
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
    } = await this.pdaFinder.getTokenAccountOf(mintAccount, payload.signer);
    const {
      address: [challengeRegistryPubkey],
    } = await this.pdaFinder.getChallengeRegistryAccount();

    /**
     * @dev Build the instruction.
     */
    const instruction = await this.program.methods
      // @ts-ignore
      .transferAssetsFromVault({
        actionType: payload.actionType,
        challengeId: payload.challengeId,
        challengeTokenVaultBump,
      })
      .accounts({
        signer: payload.signer,
        challenge: challengePubkey,
        challengeTokenVault,
        signerTokenAccount,
        challengeRegistry: challengeRegistryPubkey,
        mintAccount,
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
  private async transferAssetsToVault(payload: {
    challengeId: string;
    amount: BN;
    actionType: Record<string, any>;
    signer: PublicKey;
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
    } = await this.pdaFinder.getTokenAccountOf(mintAccount, payload.signer);

    /**
     * @dev Build the instruction.
     */
    const instruction = await this.program.methods
      // @ts-ignore
      .transferAssetsToVault({
        actionType: payload.actionType,
        challengeId: payload.challengeId,
        amount: new BN(payload.amount),
        challengeTokenVaultBump,
      })
      .accounts({
        signer: payload.signer,
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
   * @dev Join a challenge and deposit an amount of reward.
   * @param payload
   */
  public async joinChallenge(payload: {
    challengeId: string;
    amount: BN;
    signer: PublicKey;
  }): Promise<TransactionInstruction[]> {
    return this.transferAssetsToVault({
      challengeId: payload.challengeId,
      actionType: { joinChallenge: {} },
      amount: payload.amount,
      signer: payload.signer,
    });
  }

  /**
   * @dev Donate reward to a challenge.
   * @param payload
   */
  public async donateReward(payload: {
    challengeId: string;
    amount: BN;
    signer: PublicKey;
  }): Promise<TransactionInstruction[]> {
    return this.transferAssetsToVault({
      challengeId: payload.challengeId,
      actionType: { donate: {} },
      amount: payload.amount,
      signer: payload.signer,
    });
  }

  /**
   * @dev Claim reward from a challenge
   * @param payload
   */
  public async claimReward(payload: {
    challengeId: string;
    signer: PublicKey;
  }): Promise<TransactionInstruction[]> {
    return this.transferAssetsFromVault({
      challengeId: payload.challengeId,
      actionType: { claiming: {} },
      signer: payload.signer,
    });
  }

  /**
   * @dev Claim reward from a challenge
   * @param payload
   */
  public async withdrawDepositedReward(payload: {
    challengeId: string;
    signer: PublicKey;
  }): Promise<TransactionInstruction[]> {
    return this.transferAssetsFromVault({
      challengeId: payload.challengeId,
      actionType: { withdrawing: {} },
      signer: payload.signer,
    });
  }

  /**
   * @dev Claim reward from a challenge
   * @param payload
   */
  public async adminWithdrawDonatePool(payload: {
    challengeId: string;
    signer: PublicKey;
  }): Promise<TransactionInstruction[]> {
    return this.transferAssetsFromVault({
      challengeId: payload.challengeId,
      actionType: { adminWithdrawingDonatePool: {} },
      signer: payload.signer,
    });
  }
}
