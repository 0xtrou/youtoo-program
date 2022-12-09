require('dotenv').config();

import { Wallet } from '@project-serum/anchor/dist/cjs/provider';

/**
 * @dev Import deps
 */
import { ChallengeProgramState } from './challenge.state';
import { PDAFinder } from './program.finder';
import { ProgramBuilder } from './program.builder';
import { ChallengeInstructionBuilder } from './challenge.instruction';

/**
 * @dev Export endpoints
 */
export const SOLANA_DEVNET_RPC_ENDPOINT = 'https://api.devnet.solana.com';
export const SOLANA_MAINNET_RPC_RPC_ENDPOINT =
  'https://api.mainnet-beta.solana.com';

/**
 * @dev Initialize program dependencies.
 */
export const programBuilder = new ProgramBuilder(
  process.env.PROGRAM_ID,
  process.env.RPC_ENDPOINT,
);

/**
 * @dev PDA finder
 */
export const programFinder = new PDAFinder(programBuilder);

/**
 * @dev Challenge state service
 */
export const challengeState = new ChallengeProgramState(
  programBuilder,
  programFinder,
);

/**
 * @dev Get challenge program builder
 * @param walletProvider
 */
export const getChallengeBuilder = async (walletProvider: Wallet) => {
  const program = await programBuilder.getProgram(walletProvider);

  /**
   * @dev Return builder
   */
  return new ChallengeInstructionBuilder(
    programBuilder,
    program,
    programFinder,
    challengeState,
  );
};
