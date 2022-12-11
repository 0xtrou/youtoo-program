import * as anchor from '@project-serum/anchor';
import { BN, Program } from '@project-serum/anchor';
import {Keypair, Transaction, LAMPORTS_PER_SOL} from '@solana/web3.js';
import { expect } from 'chai';
import {Account, createMint, getOrCreateAssociatedTokenAccount, mintTo} from '@solana/spl-token';
import {SendTransactionError} from "@solana/web3.js";

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
            player1.publicKey
        );
        await mintTo(
            workspace.connection,
            challengeOwnerKeypair,
            challengeInfo.rewardTokenMintAccount,
            player1TokenAccount.address,
            challengeOwnerKeypair.publicKey,
            LAMPORTS_PER_SOL * 100
        );

        /**
         * @dev Mint to player2
         */
        player2TokenAccount = await getOrCreateAssociatedTokenAccount(
            workspace.connection,
            player2,
            challengeInfo.rewardTokenMintAccount,
            player2.publicKey
        );
        await mintTo(
            workspace.connection,
            challengeOwnerKeypair,
            challengeInfo.rewardTokenMintAccount,
            player2TokenAccount.address,
            challengeOwnerKeypair.publicKey,
            LAMPORTS_PER_SOL * 100
        );

        /**
         * @dev Mint to donor
         */
        donorTokenAccount = await getOrCreateAssociatedTokenAccount(
            workspace.connection,
            donor,
            challengeInfo.rewardTokenMintAccount,
            donor.publicKey
        );
        await mintTo(
            workspace.connection,
            challengeOwnerKeypair,
            challengeInfo.rewardTokenMintAccount,
            donorTokenAccount.address,
            challengeOwnerKeypair.publicKey,
            LAMPORTS_PER_SOL * 100
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
        await workspace.provider.sendAndConfirm(new Transaction().add(...challengeIns), [
            challengeOwnerKeypair,
        ]);

    });

    it('[join_challenge] should: the accounts were funded properly', async () => {
        player1TokenAccount = await getOrCreateAssociatedTokenAccount(
            workspace.connection,
            player1,
            challengeInfo.rewardTokenMintAccount,
            player1.publicKey
        );

        player2TokenAccount = await getOrCreateAssociatedTokenAccount(
            workspace.connection,
            player2,
            challengeInfo.rewardTokenMintAccount,
            player2.publicKey
        );

        donorTokenAccount = await getOrCreateAssociatedTokenAccount(
            workspace.connection,
            donor,
            challengeInfo.rewardTokenMintAccount,
            donor.publicKey
        );
        expect(Number(player1TokenAccount.amount)).eq(LAMPORTS_PER_SOL * 100);
        expect(Number(player2TokenAccount.amount)).eq(LAMPORTS_PER_SOL * 100);
        expect(Number(donorTokenAccount.amount)).eq(LAMPORTS_PER_SOL * 100);
    });

    it('[join_challenge] should: cannot join the challenge with an amount below min deposit', async () => {
       const player1Ins = await workspace.instructionBuilder.joinChallenge({
           challengeId: challengeInfo.id,
           amount: new BN(LAMPORTS_PER_SOL),
           signer: player1.publicKey
       });

       try {
           await workspace.provider.sendAndConfirm(
               new Transaction().add(...player1Ins),
               [player1]
           );

           throw new Error('Should failed here');
       } catch(e) {
           expect(e instanceof SendTransactionError).to.be.true;
       }
    });
});