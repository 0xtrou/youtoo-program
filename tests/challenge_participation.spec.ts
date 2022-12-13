import * as anchor from '@project-serum/anchor';
import { BN, Program } from '@project-serum/anchor';
import { Keypair, Transaction, LAMPORTS_PER_SOL } from '@solana/web3.js';
import { expect } from 'chai';
import {
  Account,
  createMint,
  getAccount,
  getOrCreateAssociatedTokenAccount,
  mintTo,
} from '@solana/spl-token';
import { SendTransactionError } from '@solana/web3.js';

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

/**
 * @dev Execute tests
 */
describe('[challenge_participation]', async () => {
  let workspace: Awaited<ReturnType<typeof getWorkspace>>;
  const challengeOwnerKeypair = Keypair.generate();
  const administrator = Keypair.generate();

  const donor = Keypair.generate();
  let donorTokenAccount: Account;

  const player1 = Keypair.generate();
  let player1TokenAccount: Account;

  const player2 = Keypair.generate();
  let player2TokenAccount: Account;

  const player3 = Keypair.generate();
  let player3TokenAccount: Account;

  let vaultTokenAccount: Account;

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
        donor.publicKey,
        LAMPORTS_PER_SOL * 100,
      ),
    );
    await workspace.connection.confirmTransaction(
      await provider.connection.requestAirdrop(
        administrator.publicKey,
        LAMPORTS_PER_SOL * 100,
      ),
    );
    await workspace.connection.confirmTransaction(
      await provider.connection.requestAirdrop(
        player1.publicKey,
        LAMPORTS_PER_SOL * 100,
      ),
    );
    await workspace.connection.confirmTransaction(
      await provider.connection.requestAirdrop(
        player2.publicKey,
        LAMPORTS_PER_SOL * 100,
      ),
    );
    await workspace.connection.confirmTransaction(
      await provider.connection.requestAirdrop(
        player3.publicKey,
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
     * @dev Mint to player1
     */
    player1TokenAccount = await getOrCreateAssociatedTokenAccount(
      workspace.connection,
      player1,
      challengeInfo.rewardTokenMintAccount,
      player1.publicKey,
    );
    await mintTo(
      workspace.connection,
      challengeOwnerKeypair,
      challengeInfo.rewardTokenMintAccount,
      player1TokenAccount.address,
      challengeOwnerKeypair.publicKey,
      LAMPORTS_PER_SOL * 100,
    );

    /**
     * @dev Mint to player2
     */
    player2TokenAccount = await getOrCreateAssociatedTokenAccount(
      workspace.connection,
      player2,
      challengeInfo.rewardTokenMintAccount,
      player2.publicKey,
    );
    await mintTo(
      workspace.connection,
      challengeOwnerKeypair,
      challengeInfo.rewardTokenMintAccount,
      player2TokenAccount.address,
      challengeOwnerKeypair.publicKey,
      LAMPORTS_PER_SOL * 100,
    );

    /**
     * @dev Mint to player3
     */
    player3TokenAccount = await getOrCreateAssociatedTokenAccount(
      workspace.connection,
      player3,
      challengeInfo.rewardTokenMintAccount,
      player3.publicKey,
    );
    await mintTo(
      workspace.connection,
      challengeOwnerKeypair,
      challengeInfo.rewardTokenMintAccount,
      player3TokenAccount.address,
      challengeOwnerKeypair.publicKey,
      LAMPORTS_PER_SOL * 100,
    );

    /**
     * @dev Mint to donor
     */
    donorTokenAccount = await getOrCreateAssociatedTokenAccount(
      workspace.connection,
      donor,
      challengeInfo.rewardTokenMintAccount,
      donor.publicKey,
    );
    await mintTo(
      workspace.connection,
      challengeOwnerKeypair,
      challengeInfo.rewardTokenMintAccount,
      donorTokenAccount.address,
      challengeOwnerKeypair.publicKey,
      LAMPORTS_PER_SOL * 100,
    );

    /**
     * @dev Add admin
     */
    const ins = await workspace.instructionBuilder.updateChallengeRegistry({
      allowedAdministrators: [administrator.publicKey],
      signer: workspace.provider.publicKey,
    });
    await workspace.provider.sendAndConfirm(new Transaction().add(...ins));

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
     * @dev Initialize vault token account
     */
    vaultTokenAccount = await getAccount(
      workspace.connection,
      (
        await workspace.programFinder.getTokenVaultAccount(
          challengeInfo.rewardTokenMintAccount,
        )
      ).address[0],
    );

    /**
     * @dev Build instruction
     */
    const challengeIns = await workspace.instructionBuilder.createChallenge({
      challengeId: challengeInfo.id,
      rewardMintAddress: challengeInfo.rewardTokenMintAccount,
      minDeposit: challengeInfo.minDeposit,
      signer: challengeOwnerKeypair.publicKey,
    });

    /**
     * @dev Send transaction
     */
    await workspace.provider.sendAndConfirm(
      new Transaction().add(...challengeIns),
      [challengeOwnerKeypair],
    );
  });

  it('[join_challenge] should: the accounts were funded properly', async () => {
    player1TokenAccount = await getOrCreateAssociatedTokenAccount(
      workspace.connection,
      player1,
      challengeInfo.rewardTokenMintAccount,
      player1.publicKey,
    );

    player2TokenAccount = await getOrCreateAssociatedTokenAccount(
      workspace.connection,
      player2,
      challengeInfo.rewardTokenMintAccount,
      player2.publicKey,
    );

    player3TokenAccount = await getOrCreateAssociatedTokenAccount(
      workspace.connection,
      player3,
      challengeInfo.rewardTokenMintAccount,
      player3.publicKey,
    );

    donorTokenAccount = await getOrCreateAssociatedTokenAccount(
      workspace.connection,
      donor,
      challengeInfo.rewardTokenMintAccount,
      donor.publicKey,
    );

    expect(Number(vaultTokenAccount.amount)).eq(0);
    expect(Number(player1TokenAccount.amount)).eq(LAMPORTS_PER_SOL * 100);
    expect(Number(player2TokenAccount.amount)).eq(LAMPORTS_PER_SOL * 100);
    expect(Number(player3TokenAccount.amount)).eq(LAMPORTS_PER_SOL * 100);
    expect(Number(donorTokenAccount.amount)).eq(LAMPORTS_PER_SOL * 100);
  });

  it('[join_challenge] should: cannot join the challenge with an amount below min deposit', async () => {
    const player1Ins = await workspace.instructionBuilder.joinChallenge({
      challengeId: challengeInfo.id,
      amount: new BN(LAMPORTS_PER_SOL),
      signer: player1.publicKey,
    });

    try {
      await workspace.provider.sendAndConfirm(
        new Transaction().add(...player1Ins),
        [player1],
      );

      throw new Error('Should failed here');
    } catch (e) {
      expect(e instanceof SendTransactionError).to.be.true;
    }
  });

  it('[join_challenge] should: anyone can join the challenge with an amount above min deposit', async () => {
    /**
     * @dev Player 1 join the challenge
     */
    const player1Ins = await workspace.instructionBuilder.joinChallenge({
      challengeId: challengeInfo.id,
      amount: new BN(LAMPORTS_PER_SOL * 10),
      signer: player1.publicKey,
    });

    await workspace.provider.sendAndConfirm(
      new Transaction().add(...player1Ins),
      [player1],
    );

    /**
     * @dev Player 2 join the challenge
     */
    const player2Ins = await workspace.instructionBuilder.joinChallenge({
      challengeId: challengeInfo.id,
      amount: new BN(LAMPORTS_PER_SOL * 10),
      signer: player2.publicKey,
    });

    await workspace.provider.sendAndConfirm(
      new Transaction().add(...player2Ins),
      [player2],
    );

    /**
     * @dev Player 3 join the challenge
     */
    const player3Ins = await workspace.instructionBuilder.joinChallenge({
      challengeId: challengeInfo.id,
      amount: new BN(LAMPORTS_PER_SOL * 10),
      signer: player3.publicKey,
    });

    await workspace.provider.sendAndConfirm(
      new Transaction().add(...player3Ins),
      [player3],
    );

    /**
     * @dev Expect tokens has been transferred properly.
     */
    player1TokenAccount = await getOrCreateAssociatedTokenAccount(
      workspace.connection,
      player1,
      challengeInfo.rewardTokenMintAccount,
      player1.publicKey,
    );

    player2TokenAccount = await getOrCreateAssociatedTokenAccount(
      workspace.connection,
      player2,
      challengeInfo.rewardTokenMintAccount,
      player2.publicKey,
    );

    player3TokenAccount = await getOrCreateAssociatedTokenAccount(
      workspace.connection,
      player3,
      challengeInfo.rewardTokenMintAccount,
      player3.publicKey,
    );

    vaultTokenAccount = await getAccount(
      workspace.connection,
      (
        await workspace.programFinder.getTokenVaultAccount(
          challengeInfo.rewardTokenMintAccount,
        )
      ).address[0],
    );

    expect(Number(vaultTokenAccount.amount)).eq(LAMPORTS_PER_SOL * 30);
    expect(Number(player1TokenAccount.amount)).eq(LAMPORTS_PER_SOL * 90);
    expect(Number(player2TokenAccount.amount)).eq(LAMPORTS_PER_SOL * 90);
    expect(Number(player3TokenAccount.amount)).eq(LAMPORTS_PER_SOL * 90);

    /**
     * @dev Expect challenge state has been recorded properly.
     */
    const state = await workspace.challengeState.getChallenge(challengeInfo.id);

    expect((state.players as any[]).length).eq(3);

    expect(state.players[0].publicKey.toBase58()).eq(
      player1.publicKey.toBase58(),
    );
    expect(state.players[0].totalDeposit.eq(new BN(LAMPORTS_PER_SOL * 10))).to
      .be.true;
    expect(state.players[1].publicKey.toBase58()).eq(
      player2.publicKey.toBase58(),
    );
    expect(state.players[1].totalDeposit.eq(new BN(LAMPORTS_PER_SOL * 10))).to
      .be.true;
    expect(state.players[2].publicKey.toBase58()).eq(
      player3.publicKey.toBase58(),
    );
    expect(state.players[2].totalDeposit.eq(new BN(LAMPORTS_PER_SOL * 10))).to
      .be.true;

    expect(state.prizePool.eq(new BN(LAMPORTS_PER_SOL * 30))).to.be.true;
    expect(state.donatePool.eq(new BN(LAMPORTS_PER_SOL * 0))).to.be.true;
  });

  it('[donate_to_pool] should: other people can donate to the prize pool successfully', async () => {
    /**
     * @dev Build instruction
     */
    const ins = await workspace.instructionBuilder.donateReward({
      challengeId: challengeInfo.id,
      amount: new BN(LAMPORTS_PER_SOL * 4),
      signer: donor.publicKey,
    });

    /**
     * @dev Send transaction
     */
    await workspace.provider.sendAndConfirm(new Transaction().add(...ins), [
      donor,
    ]);

    /**
     * @dev Expect balance changes
     */
    vaultTokenAccount = await getAccount(
      workspace.connection,
      (
        await workspace.programFinder.getTokenVaultAccount(
          challengeInfo.rewardTokenMintAccount,
        )
      ).address[0],
    );
    donorTokenAccount = await getOrCreateAssociatedTokenAccount(
      workspace.connection,
      donor,
      challengeInfo.rewardTokenMintAccount,
      donor.publicKey,
    );

    expect(Number(vaultTokenAccount.amount)).eq(LAMPORTS_PER_SOL * 34);
    expect(Number(donorTokenAccount.amount)).eq(LAMPORTS_PER_SOL * 96);

    /**
     * @dev Expect state
     */
    const state = await workspace.challengeState.getChallenge(challengeInfo.id);
    expect(state.prizePool.eq(new BN(LAMPORTS_PER_SOL * 34))).to.be.true;
    expect(state.donatePool.eq(new BN(LAMPORTS_PER_SOL * 4))).to.be.true;
  });

  it('[finalize_pool] should: other people than administrators/challenge owner fail to finalize the pool', async () => {
    /**
     * @dev Build instruction
     */
    const ins = await workspace.instructionBuilder.submitWinnerList({
      challengeId: challengeInfo.id,
      winnerList: [],
      signer: donor.publicKey,
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
    transaction.sign(donor);

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

  it('[finalize_pool] should: challenge owner can submit winner list', async () => {
    /**
     * @dev Build instruction
     */
    const ins = await workspace.instructionBuilder.submitWinnerList({
      challengeId: challengeInfo.id,
      winnerList: [],
      signer: challengeOwnerKeypair.publicKey,
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
    transaction.sign(challengeOwnerKeypair);

    /**
     * @dev Send transaction
     */
    await workspace.provider.simulate(transaction);
    expect(true).to.be.true;
  });

  it('[finalize_pool] should: administrator can submit winner list', async () => {
    /**
     * @dev Build instruction
     */
    const ins = await workspace.instructionBuilder.submitWinnerList({
      challengeId: challengeInfo.id,
      winnerList: [player1.publicKey, player2.publicKey],
      signer: administrator.publicKey,
    });

    /**
     * @dev Send transaction
     */
    await workspace.provider.sendAndConfirm(new Transaction().add(...ins), [
      administrator,
    ]);

    /**
     * @dev Expect state
     */
    const state = await workspace.challengeState.getChallenge(challengeInfo.id);

    /**
     * @dev Challenge status changed to Finalized
     */
    expect(!!(state.status as any).finalized).to.be.true;

    /**
     * @dev We have a winner list here
     */
    const winners = (state.players as any).filter((player) => player.isWinner);
    expect(winners.length).eq(2);
    expect(winners[0].publicKey.toBase58()).eq(player1.publicKey.toBase58());
    expect(winners[1].publicKey.toBase58()).eq(player2.publicKey.toBase58());
  });

  it('[claim_reward] should: non-winners fail to claim reward', async () => {
    /**
     * @dev Player 1 claim reward
     */
    const ins = await workspace.instructionBuilder.claimReward({
      challengeId: challengeInfo.id,
      signer: player3.publicKey,
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
    transaction.sign(player3);

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

  it('[claim_reward] should: winners can claim reward successfully', async () => {
    /**
     * @dev Player 1 claim reward
     */
    const ins = await workspace.instructionBuilder.claimReward({
      challengeId: challengeInfo.id,
      signer: player1.publicKey,
    });
    await workspace.provider.sendAndConfirm(new Transaction().add(...ins), [
      player1,
    ]);

    /**
     * @dev Player 2 claim reward
     */
    const ins2 = await workspace.instructionBuilder.claimReward({
      challengeId: challengeInfo.id,
      signer: player2.publicKey,
    });
    await workspace.provider.sendAndConfirm(new Transaction().add(...ins2), [
      player2,
    ]);

    /**
     * @dev Expect state changes
     */
    const state = await workspace.challengeState.getChallenge(challengeInfo.id);
    expect(state.prizePool.eq(new BN(LAMPORTS_PER_SOL * 34))).to.be.true;
    expect(state.donatePool.eq(new BN(LAMPORTS_PER_SOL * 4))).to.be.true;
    expect(!!(state.status as any).claimed).to.be.true;

    /**
     * @dev Expect balance changes
     */
    player1TokenAccount = await getOrCreateAssociatedTokenAccount(
      workspace.connection,
      player1,
      challengeInfo.rewardTokenMintAccount,
      player1.publicKey,
    );

    player2TokenAccount = await getOrCreateAssociatedTokenAccount(
      workspace.connection,
      player2,
      challengeInfo.rewardTokenMintAccount,
      player2.publicKey,
    );

    vaultTokenAccount = await getAccount(
      workspace.connection,
      (
        await workspace.programFinder.getTokenVaultAccount(
          challengeInfo.rewardTokenMintAccount,
        )
      ).address[0],
    );

    /**
     * @dev Expect balance changes
     */
    expect(Number(vaultTokenAccount.amount)).eq(0);
    expect(Number(player1TokenAccount.amount)).eq(LAMPORTS_PER_SOL * 107);
    expect(Number(player2TokenAccount.amount)).eq(LAMPORTS_PER_SOL * 107);
  });
});
