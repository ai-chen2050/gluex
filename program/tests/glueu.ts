import * as anchor from "@project-serum/anchor";
import { Program } from "@project-serum/anchor";
import { expect } from "chai";

describe("gluex", () => {
  anchor.setProvider(anchor.AnchorProvider.env());
  const provider = anchor.getProvider() as anchor.AnchorProvider;
  const program = anchor.workspace.Gluex as Program;

  it("creates and stores a staged goal", async () => {
    const taker = anchor.web3.Keypair.generate();
    const lamports = 2 * anchor.web3.LAMPORTS_PER_SOL;
    const airdropSig = await provider.connection.requestAirdrop(
      taker.publicKey,
      lamports
    );
    await provider.connection.confirmTransaction(airdropSig);

    const [goalsPda] = anchor.web3.PublicKey.findProgramAddressSync(
      [
        Buffer.from("gluex-goals"),
        provider.wallet.publicKey.toBuffer(),
        taker.publicKey.toBuffer(),
      ],
      program.programId
    );

    const now = Math.floor(Date.now() / 1000);
    const halfSol = Math.floor(anchor.web3.LAMPORTS_PER_SOL / 2);
    const subGoals = [
      {
        title: "Prototype milestone",
        deadline: new anchor.BN(now + 3600),
        incentiveAmount: new anchor.BN(halfSol),
        autoReleaseAt: new anchor.BN(0),
      },
      {
        title: "Launch milestone",
        deadline: new anchor.BN(now + 7200),
        incentiveAmount: new anchor.BN(halfSol),
        autoReleaseAt: new anchor.BN(0),
      },
    ];

    const config = {
      startTime: new anchor.BN(now + 60),
      surpriseTime: new anchor.BN(0),
      checkpointInterval: new anchor.BN(0),
    };

    await program.methods
      .setupGoal(
        taker.publicKey,
        "GlueX integration test goal",
        { loveGame: {} },
        { partner: {} },
        { targetAchieve: {} },
        subGoals,
        new anchor.BN(anchor.web3.LAMPORTS_PER_SOL),
        new anchor.BN(now + 7200),
        new anchor.BN(Math.floor(anchor.web3.LAMPORTS_PER_SOL / 10)),
        new anchor.BN(now + 10800),
        config
      )
      .accounts({
        goals: goalsPda,
        payer: provider.wallet.publicKey,
        systemProgram: anchor.web3.SystemProgram.programId,
      })
      .signers([])
      .rpc();

    const goalAccount = await program.account.totalGoal.fetch(goalsPda);
    expect(goalAccount.issuer.equals(provider.wallet.publicKey)).to.be.true;
    expect(goalAccount.taker.equals(taker.publicKey)).to.be.true;
    expect(goalAccount.activeSubGoals).to.eq(2);
    expect(goalAccount.totalIncentiveAmount.toNumber()).to.eq(
      anchor.web3.LAMPORTS_PER_SOL
    );
  });
});
