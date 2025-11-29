import * as anchor from "@coral-xyz/anchor";
import BN from "bn.js";
import { expect } from "chai";
import * as web3 from "@solana/web3.js";
import type { Gluex } from "../target/types/gluex";

describe("gluex", () => {
  // Configure the client to use the local cluster
  anchor.setProvider(anchor.AnchorProvider.env());

  const program = anchor.workspace.Gluex as anchor.Program<Gluex>;

  it("creates and stores a staged goal", async () => {
    const taker = web3.Keypair.generate();
    const lamports = 2 * web3.LAMPORTS_PER_SOL;
    const airdropSig = await program.provider.connection.requestAirdrop(
      taker.publicKey,
      lamports
    );
    await program.provider.connection.confirmTransaction(airdropSig);

    const [goalsPda] = web3.PublicKey.findProgramAddressSync(
      [
        Buffer.from("gluex-goals"),
        program.provider.publicKey.toBuffer(),
        taker.publicKey.toBuffer(),
      ],
      program.programId
    );

    const now = Math.floor(Date.now() / 1000);
    const totalAmount = web3.LAMPORTS_PER_SOL;

    const subGoals = [
      {
        title: "Prototype milestone",
        deadline: new BN(now + 3600),
        incentive_amount: new BN(totalAmount / 2),
        auto_release_at: new BN(0),
      },
      {
        title: "Launch milestone",
        deadline: new BN(now + 7200),
        incentive_amount: new BN(totalAmount / 2),
        auto_release_at: new BN(0),
      },
    ];

    const config = {
      start_time: new BN(now + 60),
      surprise_time: new BN(0),
      checkpoint_interval: new BN(0),
    };

    // Use TargetAchieve enum variant
    const eventType = { targetAchieve: {} };

    const txHash = await program.methods
      .setupGoal(
        taker.publicKey,
        "GlueX integration test goal",
        { loveGame: {} },
        { partner: {} },
        eventType,
        subGoals,
        new BN(totalAmount),
        new BN(now + 7200),
        new BN(Math.floor(totalAmount / 10)),
        new BN(now + 10800),
        config
      )
      .accounts({
        goals: goalsPda,
        payer: program.provider.publicKey,
        systemProgram: web3.SystemProgram.programId,
      })
      .rpc();

    console.log(`Use 'solana confirm -v ${txHash}' to see the logs`);

    // Confirm transaction
    await program.provider.connection.confirmTransaction(txHash);

    const goalAccount = await program.account.totalGoal.fetch(goalsPda);
    console.log("Goal Account:", goalAccount);
    
    expect(goalAccount.issuer.equals(program.provider.publicKey)).to.be.true;
    expect(goalAccount.taker.equals(taker.publicKey)).to.be.true;
    expect(goalAccount.activeSubGoals).to.eq(2);
    expect(goalAccount.totalIncentiveAmount.toNumber()).to.eq(totalAmount);
  });
});
