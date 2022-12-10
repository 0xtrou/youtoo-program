import { PublicKey, Keypair, AccountInfo } from '@solana/web3.js';
import { Wallet } from '@project-serum/anchor';
import * as anchor from '@project-serum/anchor';
import * as SPlTokenService from '@solana/spl-token';

import { ProgramBuilder } from './program.builder';

/**
 * @dev Define the response from pda finder.
 */
export interface PDAFinderResponse {
  accountInfo: AccountInfo<Buffer> | null;
  address: [PublicKey, number];
}

export class PDAFinder {
  /**
   * @dev constructor initializes the program finder.
   * @param programBuilder
   * @param splTokenService
   */
  constructor(
    private readonly programBuilder: ProgramBuilder,
    private readonly splTokenService: typeof SPlTokenService = SPlTokenService,
  ) {}

  /**
   * @dev Find challenge PDA.
   * We use a read-only public program authority to avoid unexpected behaviors related to user wallet connection.
   * @param challengeId
   */
  public async getChallengeAccount(
    challengeId: string,
  ): Promise<PDAFinderResponse> {
    const program = await this.programBuilder.getProgram(
      new Wallet(Keypair.generate()),
    );

    const [pubkey, bump] = PublicKey.findProgramAddressSync(
      [
        anchor.utils.bytes.utf8.encode('SEED::CHALLENGE'),
        anchor.utils.bytes.utf8.encode(challengeId.slice(0, 10)),
      ],
      program.programId,
    );

    return {
      accountInfo: await this.programBuilder
        .getConnection()
        .getAccountInfo(pubkey),
      address: [pubkey, bump],
    };
  }

  /**
   * @dev Find challenge registry pda.
   * We use a read-only public program authority to avoid unexpected behaviors related to user wallet connection.
   */
  public async getChallengeRegistryAccount(): Promise<PDAFinderResponse> {
    const program = await this.programBuilder.getProgram(
      new Wallet(Keypair.generate()),
    );

    // find the swap account
    const [pubkey, bump] = PublicKey.findProgramAddressSync(
      [anchor.utils.bytes.utf8.encode('SEED::CHALLENGE::PLATFORM')],
      program.programId,
    );

    return {
      accountInfo: await this.programBuilder
        .getConnection()
        .getAccountInfo(pubkey),
      address: [pubkey, bump],
    };
  }

  /**
   * @dev Find challenge registry pda.
   * We use a read-only public program authority to avoid unexpected behaviors related to user wallet connection.
   */
  public async getTokenVaultAccount(
    mintAccount: string,
  ): Promise<PDAFinderResponse> {
    const program = await this.programBuilder.getProgram(
      new Wallet(Keypair.generate()),
    );

    // find the swap account
    const [pubkey, bump] = PublicKey.findProgramAddressSync(
      [
        anchor.utils.bytes.utf8.encode('SEED::CHALLENGE::TOKEN_VAULT'),
        new PublicKey(mintAccount).toBytes(),
      ],
      program.programId,
    );

    return {
      accountInfo: await this.programBuilder
        .getConnection()
        .getAccountInfo(pubkey),
      address: [pubkey, bump],
    };
  }

  /**
   * @dev Get associated token account of a public key.
   * @param mint
   * @param pubkey
   */
  public async getTokenAccountOf(
    mint: PublicKey,
    pubkey: PublicKey,
  ): Promise<PDAFinderResponse> {
    const address = await this.splTokenService.getAssociatedTokenAddress(
      mint,
      pubkey,
    );

    /**
     * @dev Return response
     */
    return {
      accountInfo: await this.programBuilder
        .getConnection()
        .getAccountInfo(address),
      address: [address, 0], // bump is not available
    };
  }
}
