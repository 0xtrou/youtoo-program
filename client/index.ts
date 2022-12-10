import { Wallet } from '@project-serum/anchor/dist/cjs/provider';

/**
 * @dev Import deps
 */
import { ChallengeProgramState } from './challenge.state';
import { PDAFinder } from './program.finder';
import { ProgramBuilder } from './program.builder';
import { ChallengeInstructionBuilder } from './challenge.instruction';

/**
 * @dev Get challenge program builder
 * @param programId
 * @param rpcEndpoint
 * @param walletProvider
 */
export const getWorkspace = async (
  programId: string,
  rpcEndpoint: string,
  walletProvider: Wallet,
) => {
  /**
   * @dev Initialize program dependencies.
   */
  const programBuilder = new ProgramBuilder(programId, rpcEndpoint);

  /**
   * @dev PDA finder
   */
  const programFinder = new PDAFinder(programBuilder);

  /**
   * @dev Challenge state service
   */
  const challengeState = new ChallengeProgramState(
    programBuilder,
    programFinder,
  );

  /**
   * @dev Get program
   */
  const program = await programBuilder.getProgram(walletProvider);

  /**
   * @dev Get instruction builder
   */
  const instructionBuilder = new ChallengeInstructionBuilder(
    programBuilder,
    program,
    programFinder,
    challengeState,
  );

  /**
   * @dev Return builder
   */
  return {
    programBuilder,
    challengeState,
    program,
    programFinder,
    instructionBuilder,
    connection: programBuilder.getConnection(),
    provider: program.provider,
  };
};
