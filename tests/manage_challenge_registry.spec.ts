import * as anchor from '@project-serum/anchor';
import { Program } from '@project-serum/anchor';
import { Keypair, SendTransactionError, Transaction } from '@solana/web3.js';
import { expect } from 'chai';

/**
 * @dev Import deps
 */
import { Challenge } from '../client/challenge.idl';
import { getWorkspace } from '../client';

/**
 * @dev Initialize provider to get wallet provider, cluster node and program id.
 * Theses params can be configured elsewhere that not related to anchor.
 */
const provider = anchor.AnchorProvider.env();
anchor.setProvider(provider);
const program = anchor.workspace.Challenge as Program<Challenge>;
const walletProvider = provider.wallet as anchor.Wallet;

describe('[initialize_challenge_registry]', async () => {
  let workspace: Awaited<ReturnType<typeof getWorkspace>>;

  /**
   * @dev Initialize workspace.
   */
  before(async () => {
    workspace = await getWorkspace(
      program.programId.toBase58(),
      provider.connection.rpcEndpoint,
      walletProvider,
    );
  });

  it('[initialize_challenge_registry] should: empty state', async () => {
    /**
     * @dev Initial state must be empty.
     */
    try {
      await workspace.challengeState.getChallengeRegistry();
      throw new Error('should be failed here');
    } catch (e) {
      expect(e.toString().includes('Error: Account does not exist')).to.be.true;
    }
  });

  it('[initialize_challenge_registry] should: deployer should initialize successfully', async () => {
    /**
     * @dev Initialize registry
     */
    const ins =
      await workspace.instructionBuilder.initializeChallengeRegistry();

    /**
     * @dev send transaction
     */
    const transaction = new Transaction();
    transaction.add(...ins);

    await workspace.provider.sendAndConfirm(transaction);

    /**
     * @dev Fetch state
     */
    const state = await workspace.challengeState.getChallengeRegistry();

    /**
     * @dev Expect
     */
    expect(state.owner.toBase58()).eq(workspace.provider.publicKey.toBase58());
    expect(state.wasInitialized).to.be.true;
    expect(state.allowedAdministrators.length).eq(0);
    // @ts-ignore
    expect(state.allowedMintAccounts.length).eq(0);
  });

  it('[initialize_challenge_registry] should: deployer can update administrators list', async () => {
    const keypair = Keypair.generate();

    /**
     * @dev Build instruction
     */
    const ins = await workspace.instructionBuilder.updateChallengeRegistry({
      allowedAdministrators: [keypair.publicKey],
      signer: workspace.provider.publicKey,
    });

    /**
     * @dev SEnd transaction
     */
    const transaction = new Transaction();
    transaction.add(...ins);

    await workspace.provider.sendAndConfirm(transaction);

    /**
     * @dev Expect state
     */
    const state = await workspace.challengeState.getChallengeRegistry();

    expect(state.owner.toBase58()).eq(workspace.provider.publicKey.toBase58());
    expect(state.wasInitialized).to.be.true;
    expect(state.allowedAdministrators.length).eq(1);
    expect(state.allowedAdministrators[0].toBase58()).eq(
      keypair.publicKey.toBase58(),
    );
    // @ts-ignore
    expect(state.allowedMintAccounts.length).eq(0);
  });

  it('[initialize_challenge_registry] should: non-deployer fail to update registry', async () => {
    try {
      const keypair = Keypair.generate();

      /**
       * @dev Build instruction
       */
      const ins = await workspace.instructionBuilder.updateChallengeRegistry({
        allowedAdministrators: [keypair.publicKey],
        signer: keypair.publicKey,
      });

      /**
       * @dev SEnd transaction
       */
      const transaction = new Transaction();
      transaction.add(...ins);

      await workspace.provider.sendAndConfirm(transaction, [keypair]);

      throw new Error('should be failed here');
    } catch (e) {
      expect(e instanceof SendTransactionError).to.be.true;
    }
  });
});
