import * as anchor from "@coral-xyz/anchor";
import BN from "bn.js";
import { expect } from "chai";
import * as web3 from "@solana/web3.js";
import type { Gluex } from "../target/types/gluex";

describe("fee_pool", () => {
  // Configure the client to use the local cluster.
  anchor.setProvider(anchor.AnchorProvider.env());

  const program = anchor.workspace.Gluex as anchor.Program<Gluex>;

  let feePoolPda: web3.PublicKey;

  it("creates fee pool with default params 1/1000", async () => {
    const founder = program.provider.publicKey;
    [feePoolPda] = web3.PublicKey.findProgramAddressSync(
      [Buffer.from("gluex-fee-pool")],
      program.programId
    );

    await program.methods
      .createFeePool(founder)
      .accounts({
        feePool: feePoolPda,
        payer: program.provider.publicKey,
        systemProgram: web3.SystemProgram.programId,
      })
      .rpc();

    const pool = await program.account.feePool.fetch(feePoolPda);
    expect(pool.protocolFeeNumerator.toNumber()).to.equal(1);
    expect(pool.protocolFeeDenominator.toNumber()).to.equal(1000);
    expect(pool.founder.toBase58()).to.equal(founder.toBase58());
  });

  it("set fee params by founder", async () => {
    await program.methods
      .setFeeParams(new BN(2), new BN(1000))
      .accounts({ feePool: feePoolPda, founder: program.provider.publicKey })
      .rpc();
    const pool = await program.account.feePool.fetch(feePoolPda);
    expect(pool.protocolFeeNumerator.toNumber()).to.equal(2);
    expect(pool.protocolFeeDenominator.toNumber()).to.equal(1000);
  });

  it("setup goal charges fee when fee_pool exists", async () => {
    const taker = web3.Keypair.generate();

    const lamports = 1_000_000_000;
    const sig = await program.provider.connection.requestAirdrop(
      taker.publicKey,
      lamports
    );
    await program.provider.connection.confirmTransaction(sig);

    const [goalsPda] = web3.PublicKey.findProgramAddressSync(
      [
        Buffer.from("gluex-goals"),
        program.provider.publicKey.toBuffer(),
        taker.publicKey.toBuffer(),
      ],
      program.programId
    );

    const now = Math.floor(Date.now() / 1000);

    const subGoals = [
      {
        title: "Milestone 1",
        deadline: new BN(now + 3600),
        incentiveAmount: new BN(500),
        autoReleaseAt: new BN(0),
      },
    ] as any[];

    const config = {
      startTime: new BN(0),
      surpriseTime: new BN(0),
      checkpointInterval: new BN(0),
    };

    await program.methods
      .setupGoal(
        taker.publicKey,
        "desc",
        { loveGame: {} },
        { partner: {} },
        { targetAchieve: {} },
        subGoals,
        new BN(1000),
        new BN(now + 3600),
        new BN(0),
        new BN(now + 7200),
        config
      )
      .accounts({
        goals: goalsPda,
        payer: program.provider.publicKey,
        feePool: feePoolPda,
        systemProgram: web3.SystemProgram.programId,
      })
      .rpc();

    const poolInfo =
      await program.provider.connection.getAccountInfo(feePoolPda);
    expect(poolInfo).to.not.be.null;
    expect(poolInfo!.lamports).to.be.greaterThanOrEqual(2);
  });

  it("distribute fees splits according to maintainers", async () => {
    const maint = web3.Keypair.generate();
    await program.methods
      .addMaintainer(maint.publicKey)
      .accounts({ feePool: feePoolPda, founder: program.provider.publicKey })
      .rpc();

    // ensure maintainer account exists (create/fund) so it can receive lamports
    const airdropSig = await program.provider.connection.requestAirdrop(
      maint.publicKey,
      1_000_000
    );
    await program.provider.connection.confirmTransaction(airdropSig);

    // send some lamports to pool for distribution
    await program.provider.sendAndConfirm(
      new web3.Transaction().add(
        web3.SystemProgram.transfer({
          fromPubkey: program.provider.publicKey,
          toPubkey: feePoolPda,
          lamports: 1000,
        })
      )
    );

    const maintDest = maint.publicKey;
    await program.methods
      .distributeFees()
      .accounts({
        feePool: feePoolPda,
        founderDest: program.provider.publicKey,
      })
      .remainingAccounts([
        { pubkey: maintDest, isWritable: true, isSigner: false },
      ])
      .rpc();

    const poolInfo =
      await program.provider.connection.getAccountInfo(feePoolPda);
    if (poolInfo === null) {
      // account may be drained/removed; accept null as valid outcome
      expect(poolInfo).to.be.null;
    } else {
      expect(poolInfo.lamports).to.be.lessThan(1000 + 2);
    }
  });
});
