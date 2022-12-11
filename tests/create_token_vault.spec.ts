import * as anchor from '@project-serum/anchor';
import { Program } from '@project-serum/anchor';
import {
  Keypair,
  Transaction,
  LAMPORTS_PER_SOL,
  PublicKey,
  SendTransactionError,
} from '@solana/web3.js';
import { expect } from 'chai';
import { createMint } from '@solana/spl-token';

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
describe('[create_token_vault]', async () => {
  let workspace: Awaited<ReturnType<typeof getWorkspace>>;
  const keypair = Keypair.generate();
  let mintTokenAccount: PublicKey;

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
    const signature = await provider.connection.requestAirdrop(
      keypair.publicKey,
      LAMPORTS_PER_SOL * 100,
    );
    await workspace.connection.confirmTransaction(signature);

    /**
     * @dev Expect state
     */
    expect(await provider.connection.getBalance(keypair.publicKey)).eq(
      LAMPORTS_PER_SOL * 100,
    );

    /**
     * @dev Create a mint account
     */
    mintTokenAccount = await createMint(
      workspace.connection,
      keypair,
      keypair.publicKey,
      keypair.publicKey,
      9,
    );
  });

  /**
   * @dev Declare test cases
   */
  it('[create_token_vault] should: non-administrator fail to create token vault', async () => {
    /**
     * @dev Build instruction
     */
    const ins = await workspace.instructionBuilder.createTokenVault({
      mintTokenAddress: mintTokenAccount.toBase58(),
      signer: keypair.publicKey,
    });

    /**
     * @dev Send transaction
     */
    const transaction = new Transaction();
    transaction.add(...ins);

    try {
      await workspace.provider.sendAndConfirm(transaction, [keypair]);
      throw new Error('should be failed');
    } catch (e) {
      expect(e instanceof SendTransactionError).to.be.true;
    }
  });

  /**
   * @dev Declare test cases
   */
  it('[create_token_vault] should: only administrator can create token vault', async () => {
    /**
     * @dev Build instruction
     */
    const ins = await workspace.instructionBuilder.createTokenVault({
      mintTokenAddress: mintTokenAccount.toBase58(),
      signer: workspace.provider.publicKey,
    });

    /**
     * @dev Send transaction
     */
    const transaction = new Transaction();
    transaction.add(...ins);

    await workspace.provider.sendAndConfirm(transaction);

    /**
     * @dev Expect state
     */
    const state = await workspace.challengeState.getChallengeRegistry();
    // @ts-ignore
    expect(state.allowedMintAccounts.length).eq(1);
    expect(
      // @ts-ignore
      !!state.allowedMintAccounts.find(
        (item) =>
          item.mintAccount.toBase58() === mintTokenAccount.toBase58() &&
          item.isEnabled === true &&
          !!item.bump &&
          !!item.tokenAccount,
      ),
    );
  });
});
