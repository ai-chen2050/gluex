import * as anchor from "@coral-xyz/anchor";
import BN from "bn.js";
import { expect } from "chai";
import * as web3 from "@solana/web3.js";
import type { Gluex } from "../target/types/gluex";

describe("gamified_bounty", () => {
  anchor.setProvider(anchor.AnchorProvider.env());
  const program = anchor.workspace.Gluex as anchor.Program<Gluex>;

  const issuer = web3.Keypair.generate();
  const taker = web3.Keypair.generate();
  const referrer = web3.Keypair.generate();

  let bountyPda: web3.PublicKey;
  let bountyExecutionPda: web3.PublicKey;
  let takerProfilePda: web3.PublicKey;
  let referrerProfilePda: web3.PublicKey;

  before(async () => {
    // Airdrop SOL
    for (const keypair of [issuer, taker, referrer]) {
      const sig = await program.provider.connection.requestAirdrop(
        keypair.publicKey,
        10 * web3.LAMPORTS_PER_SOL
      );
      await program.provider.connection.confirmTransaction(sig);
    }
  });

  it("registers agent profiles", async () => {
    // Register referrer
    [referrerProfilePda] = web3.PublicKey.findProgramAddressSync(
      [Buffer.from("agent-profile"), referrer.publicKey.toBuffer()],
      program.programId
    );

    await program.methods
      .registerProfile(null)
      .accounts({
        profile: referrerProfilePda,
        payer: referrer.publicKey,
        systemProgram: web3.SystemProgram.programId,
      })
      .signers([referrer])
      .rpc();

    // Register taker with referrer
    [takerProfilePda] = web3.PublicKey.findProgramAddressSync(
      [Buffer.from("agent-profile"), taker.publicKey.toBuffer()],
      program.programId
    );

    await program.methods
      .registerProfile(referrer.publicKey)
      .accounts({
        profile: takerProfilePda,
        payer: taker.publicKey,
        systemProgram: web3.SystemProgram.programId,
      })
      .signers([taker])
      .rpc();

    const fetchProfile = await program.account.agentProfile.fetch(takerProfilePda);
    expect(fetchProfile.invitedBy.toBase58()).to.equal(referrer.publicKey.toBase58());
    expect(fetchProfile.reputationScore.toNumber()).to.equal(0);
  });

  it("publishes an open bounty", async () => {
    const bountyId = new BN(1);
    const amount = new BN(web3.LAMPORTS_PER_SOL);
    
    [bountyPda] = web3.PublicKey.findProgramAddressSync(
      [Buffer.from("open-bounty"), issuer.publicKey.toBuffer(), Buffer.from(bountyId.toArray("le", 8))],
      program.programId
    );

    await program.methods
      .publishBounty(
        bountyId,
        "Translate landing page to Spanish",
        "Maintain same tone, deliver in md format",
        amount,
        new BN(Math.floor(Date.now() / 1000) + 86400),
        1
      )
      .accounts({
        openBounty: bountyPda,
        issuer: issuer.publicKey,
        systemProgram: web3.SystemProgram.programId,
      })
      .signers([issuer])
      .rpc();

    const bountyInfo = await program.account.openBounty.fetch(bountyPda);
    expect(bountyInfo.incentiveAmount.toNumber()).to.equal(amount.toNumber());
    expect(bountyInfo.maxClaims).to.equal(1);
  });

  it("claims a bounty", async () => {
    [bountyExecutionPda] = web3.PublicKey.findProgramAddressSync(
      [Buffer.from("bounty-exec"), bountyPda.toBuffer(), taker.publicKey.toBuffer()],
      program.programId
    );

    await program.methods
      .claimBounty()
      .accounts({
        openBounty: bountyPda,
        bountyExecution: bountyExecutionPda,
        taker: taker.publicKey,
        systemProgram: web3.SystemProgram.programId,
      })
      .signers([taker])
      .rpc();

    const execInfo = await program.account.bountyExecution.fetch(bountyExecutionPda);
    expect(execInfo.taker.toBase58()).to.equal(taker.publicKey.toBase58());
    expect(execInfo.isApproved).to.be.false;

    const bountyInfo = await program.account.openBounty.fetch(bountyPda);
    expect(bountyInfo.currentClaims).to.equal(1);
  });

  it("verifies and rewards bounty with gamification", async () => {
    const preBalance = await program.provider.connection.getBalance(taker.publicKey);

    await program.methods
      .verifyAndRewardBounty(true)
      .accounts({
        openBounty: bountyPda,
        bountyExecution: bountyExecutionPda,
        issuer: issuer.publicKey,
        takerAccount: taker.publicKey,
        takerProfile: takerProfilePda,
        referrerProfile: referrerProfilePda,
      })
      .signers([issuer])
      .rpc();

    const postBalance = await program.provider.connection.getBalance(taker.publicKey);
    expect(postBalance).to.be.greaterThan(preBalance);

    const takerProf = await program.account.agentProfile.fetch(takerProfilePda);
    expect(takerProf.reputationScore.toNumber()).to.equal(100);
    expect(takerProf.tasksCompleted).to.equal(1);

    const refProf = await program.account.agentProfile.fetch(referrerProfilePda);
    expect(refProf.reputationScore.toNumber()).to.equal(10);
  });

  it("records a social interaction", async () => {
    const [connPda] = web3.PublicKey.findProgramAddressSync(
      [Buffer.from("social-conn"), issuer.publicKey.toBuffer(), taker.publicKey.toBuffer()],
      program.programId
    );

    await program.methods
      .recordSocialInteraction()
      .accounts({
        connection: connPda,
        userA: issuer.publicKey,
        userB: taker.publicKey,
        systemProgram: web3.SystemProgram.programId,
      })
      .signers([issuer])
      .rpc();

    const connFetch = await program.account.socialConnection.fetch(connPda);
    expect(connFetch.interactionCount.toNumber()).to.equal(1);
    expect(connFetch.userA.toBase58()).to.equal(issuer.publicKey.toBase58());
  });
});
