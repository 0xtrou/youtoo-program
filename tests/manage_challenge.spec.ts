import * as anchor from '@project-serum/anchor';
import { BN, Program } from '@project-serum/anchor';
import {
  Keypair,
  Transaction,
  LAMPORTS_PER_SOL,
  SendTransactionError,
} from '@solana/web3.js';
import { expect } from 'chai';

/**
 * @dev Import deps
 */
import { Challenge } from '../client/challenge.idl';
import { getWorkspace } from '../client';
import { createMint } from '@solana/spl-token';

/**
 * @dev Initialize provider to get wallet provider, cluster node and program id.
 * Theses params can be configured elsewhere that not related to anchor.
 */
const provider = anchor.AnchorProvider.env();
anchor.setProvider(provider);
const program = anchor.workspace.Challenge as Program<Challenge>;
const walletProvider = provider.wallet as anchor.Wallet;

/**
 * @dev Execute tests
 */
describe('[manage_challenge]', async () => {
  let workspace: Awaited<ReturnType<typeof getWorkspace>>;
  const challengeOwnerKeypair = Keypair.generate();
  const otherPerson = Keypair.generate();
  const administrator = Keypair.generate();

  /**
   * @dev Initialize challenge info
   */
  const challengeInfo = {
    id: Keypair.generate().publicKey.toBase58().slice(0, 10),
    minDeposit: new BN(LAMPORTS_PER_SOL * 10),
    rewardTokenMintAccount: null,
  };

  /**
   * @dev Initialize workspace.
   */
  before(async () => {
    workspace = await getWorkspace(
      program.programId.toBase58(),
      provider.connection.rpcEndpoint,
      walletProvider,
    );

    /**
     * @dev request airdrop for gas fee
     */
    await workspace.connection.confirmTransaction(
      await provider.connection.requestAirdrop(
        challengeOwnerKeypair.publicKey,
        LAMPORTS_PER_SOL * 100,
      ),
    );
    await workspace.connection.confirmTransaction(
      await provider.connection.requestAirdrop(
        otherPerson.publicKey,
        LAMPORTS_PER_SOL * 100,
      ),
    );
    await workspace.connection.confirmTransaction(
      await provider.connection.requestAirdrop(
        administrator.publicKey,
        LAMPORTS_PER_SOL * 100,
      ),
    );

    /**
     * @dev Create a mint account
     */
    challengeInfo.rewardTokenMintAccount = await createMint(
      workspace.connection,
      challengeOwnerKeypair,
      challengeOwnerKeypair.publicKey,
      challengeOwnerKeypair.publicKey,
      9,
    );

    /**
     * @dev Add admin
     */
    const ins = await workspace.instructionBuilder.updateChallengeRegistry({
      allowedAdministrators: [administrator.publicKey],
      signer: workspace.provider.publicKey,
    });
    await workspace.provider.sendAndConfirm(new Transaction().add(...ins));
  });

  /**
   * @dev Declare test cases
   */
  it('[create_challenge] should: fail to create a challenge with un-allowed mint account', async () => {
    /**
     * @dev Build instruction
     */
    const ins = await workspace.instructionBuilder.createChallenge({
      challengeId: challengeInfo.id,
      rewardMintAddress: challengeInfo.rewardTokenMintAccount,
      minDeposit: challengeInfo.minDeposit,
      signer: challengeOwnerKeypair.publicKey,
    });

    /**
     * @dev Build transaction
     */
    const transaction = new Transaction();
    transaction.add(...ins);

    /**
     * @dev Send transaction
     */
    try {
      await workspace.provider.sendAndConfirm(transaction, [
        challengeOwnerKeypair,
      ]);
      throw new Error('should fail here');
    } catch (e) {
      expect(e instanceof SendTransactionError).to.be.true;
    }
  });

  it('[create_challenge] should: anyone can create a challenge publicly', async () => {
    /**
     * @dev Admin create token vault first.
     */
    const createTokenVaultIns =
      await workspace.instructionBuilder.createTokenVault({
        mintTokenAddress: challengeInfo.rewardTokenMintAccount,
        signer: administrator.publicKey,
      });
    await workspace.provider.sendAndConfirm(
      new Transaction().add(...createTokenVaultIns),
      [administrator],
    );

    /**
     * @dev Build instruction
     */
    const ins = await workspace.instructionBuilder.createChallenge({
      challengeId: challengeInfo.id,
      rewardMintAddress: challengeInfo.rewardTokenMintAccount,
      minDeposit: challengeInfo.minDeposit,
      signer: challengeOwnerKeypair.publicKey,
    });

    /**
     * @dev Build transaction
     */
    const transaction = new Transaction();
    transaction.add(...ins);

    /**
     * @dev Send transaction
     */
    await workspace.provider.sendAndConfirm(transaction, [
      challengeOwnerKeypair,
    ]);

    /**
     * @dev Expect state
     */
    const state = await workspace.challengeState.getChallenge(challengeInfo.id);

    expect(state.id).eq(challengeInfo.id);
    expect(state.rewardTokenMintAccount.toBase58()).eq(
      challengeInfo.rewardTokenMintAccount.toBase58(),
    );
    expect(state.owner.toBase58()).eq(
      challengeOwnerKeypair.publicKey.toBase58(),
    );
    // @ts-ignore
    expect(!!state.status.created).to.be.true;
    // @ts-ignore
    expect(state.players.length).eq(0);
    expect(state.prizePool.eq(new BN(0))).to.be.true;
    expect(state.donatePool.eq(new BN(0))).to.be.true;
  });

  it('[cancel_challenge] should: outsider cannot cancel the challenge', async () => {
    /**
     * @dev Build instruction
     */
    const ins = await workspace.instructionBuilder.cancelChallenge({
      challengeId: challengeInfo.id,
      signer: otherPerson.publicKey,
    });

    /**
     * @dev Build transaction
     */
    const transaction = new Transaction();
    transaction.add(...ins);
    transaction.recentBlockhash = (
      await workspace.connection.getLatestBlockhash()
    ).blockhash;
    transaction.lastValidBlockHeight = (
      await workspace.connection.getLatestBlockhash()
    ).lastValidBlockHeight;
    transaction.sign(otherPerson);

    /**
     * @dev Send transaction
     */
    try {
      await workspace.provider.simulate(transaction);
      throw new Error('should fail here');
    } catch (e) {
      expect(JSON.stringify(e).includes('InstructionError')).to.be.true;
    }
  });

  it('[cancel_challenge] should: administrator cannot cancel the challenge', async () => {
    /**
     * @dev Build instruction
     */
    const ins = await workspace.instructionBuilder.cancelChallenge({
      challengeId: challengeInfo.id,
      signer: administrator.publicKey,
    });

    /**
     * @dev Build transaction
     */
    const transaction = new Transaction();
    transaction.add(...ins);
    transaction.recentBlockhash = (
      await workspace.connection.getLatestBlockhash()
    ).blockhash;
    transaction.lastValidBlockHeight = (
      await workspace.connection.getLatestBlockhash()
    ).lastValidBlockHeight;
    transaction.sign(administrator);

    /**
     * @dev Send transaction
     */
    try {
      await workspace.provider.simulate(transaction);
    } catch (e) {
      expect(JSON.stringify(e).includes('InstructionError')).to.be.true;
    }
  });

  it('[cancel_challenge] should: challenge owner can cancel the challenge', async () => {
    /**
     * @dev Build instruction
     */
    const ins = await workspace.instructionBuilder.cancelChallenge({
      challengeId: challengeInfo.id,
      signer: challengeOwnerKeypair.publicKey,
    });

    /**
     * @dev Build transaction
     */
    const transaction = new Transaction();
    transaction.add(...ins);

    /**
     * @dev Send transaction
     */
    await workspace.provider.sendAndConfirm(transaction, [
      challengeOwnerKeypair,
    ]);

    /**
     * @dev Expect state
     */
    const state = await workspace.challengeState.getChallenge(challengeInfo.id);

    expect(state.id).eq(challengeInfo.id);
    // @ts-ignore
    expect(!!state.status.canceled).to.be.true;
  });
});
