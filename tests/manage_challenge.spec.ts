import * as anchor from '@project-serum/anchor';
import {Program} from '@project-serum/anchor';
import {Keypair, Transaction, LAMPORTS_PER_SOL} from '@solana/web3.js';
import {expect} from "chai";

/**
 * @dev Import deps
 */
import {Challenge} from '../client/challenge.idl';
import {getWorkspace} from '../client';

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
describe('[create_challenge]', async () => {
  let workspace: Awaited<ReturnType<typeof getWorkspace>>;
  let keypair = Keypair.generate();

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
    await provider.connection.requestAirdrop(keypair.publicKey, LAMPORTS_PER_SOL * 100);

  });

  /**
   * @dev Declare test cases
   */
  it('[create_challenge] should: anyone can create a challenge successfully', async () => {

  });
});
