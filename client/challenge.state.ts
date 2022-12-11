import { Keypair, PublicKey } from '@solana/web3.js';
import { Wallet } from '@project-serum/anchor';

/**
 * @dev Import deps.
 */
import { ProgramBuilder } from './program.builder';
import {
  ChallengePlatformRegistryState,
  ChallengeState,
} from './challenge.idl';
import { PDAFinder } from './program.finder';

/**
 * @dev Define the challenge state
 */
export class ChallengeProgramState {
  /**
   * @dev Constructor that initializes the challenge state.
   * @param programBuilder
   * @param programFinder
   */
  public constructor(
    private readonly programBuilder: ProgramBuilder,
    private readonly programFinder: PDAFinder,
  ) {}

  /**
   * @dev Get challenge state.
   * We use a read-only public program authority to avoid unexpected behaviors related to user wallet connection.
   * @param challengeId
   */
  public async getChallenge(challengeId: string): Promise<ChallengeState> {
    const program = await this.programBuilder.getProgram(
      new Wallet(Keypair.generate()),
    );

    const challengeAddress = await this.programFinder.getChallengeAccount(
      challengeId,
    );
    return program.account.challenge.fetch(challengeAddress.address[0]);
  }

  /**
   * @dev Get challenge registry state.
   * We use a read-only public program authority to avoid unexpected behaviors related to user wallet connection.
   */
  public async getChallengeRegistry(): Promise<ChallengePlatformRegistryState> {
    const program = await this.programBuilder.getProgram(
      new Wallet(Keypair.generate()),
    );

    const challengeRegistryAddress =
      await this.programFinder.getChallengeRegistryAccount();

    return program.account.challengePlatformRegistry.fetch(
      challengeRegistryAddress.address[0],
    );
  }

  /**
   * @dev Get whitelisted token, currently we get the first one as the default token.
   */
  public async getWhitelistedToken(): Promise<[PublicKey, number]> {
    const challengeRegistry = await this.getChallengeRegistry();

    /**
     * @dev Raise error if mint account is not available.
     */
    if ((challengeRegistry.allowedMintAccounts as any[]).length === 0) {
      throw new Error('MINT_ACCOUNT::NOT_AVAILABLE');
    }

    /**
     * @dev Extract mint account data from state.
     */
    const { mintAccount, bump }: { mintAccount: PublicKey; bump: number } = (
      challengeRegistry.allowedMintAccounts as any[]
    ).pop();

    /**
     * @dev Return the account.
     */
    return [mintAccount, bump];
  }
}
