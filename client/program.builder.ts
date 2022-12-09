import { Wallet } from '@project-serum/anchor/dist/cjs/provider';
import { Connection } from '@solana/web3.js';
import * as anchor from '@project-serum/anchor';
import { Program } from '@project-serum/anchor';

/**
 * @dev Import IDL here
 */
import type { Challenge } from './challenge.idl';
import { IDL } from './challenge.idl';

/**
 * @dev Export program type
 */
export type ChallengeProgram = Program<Challenge>;

/**
 * @dev Export connection builder
 *
 */
export class ProgramBuilder {
  /**
   * @dev Challenge program idl
   * @private
   */
  public readonly idl: Challenge;

  /**
   * @dev RPC endpoint
   * @private
   */
  public readonly rpcEndpoint: string;

  /**
   * @dev Program endpoint
   * @private
   */
  public readonly programId: string;

  /**
   * @dev Initialize swap program provider.
   */
  public constructor(
    programId: string,
    rpcEndpoint: string,
    idl: Challenge = IDL,
  ) {
    /**
     * @dev Binding cluster
     */
    this.rpcEndpoint = rpcEndpoint;

    /**
     * @dev Binding program id.
     */
    this.programId = programId;

    /**
     * @dev Binding idl.
     */
    this.idl = idl;
  }

  /**
   * @dev Get program
   * @private
   */
  public async getProgram(walletProvider: Wallet) {
    /**
     * @dev Prepares for some infra config
     */
    const connection = new Connection(this.rpcEndpoint, 'processed');
    const provider = new anchor.AnchorProvider(connection, walletProvider, {
      preflightCommitment: 'processed',
      commitment: 'processed',
    });

    /**
     * @dev Now we create program instance
     */
    return new Program<Challenge>(this.idl, this.programId, provider);
  }

  /**
   * @dev Get connection
   */
  public getConnection() {
    return new Connection(this.rpcEndpoint, 'processed');
  }
}
