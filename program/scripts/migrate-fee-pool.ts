// Script to migrate the fee pool to a new structure
// ANCHOR_WALLET=~/.config/solana/id.json yarn ts-node scripts/migrate-fee-pool.ts
// 或：ANCHOR_WALLET=~/.config/solana/id.json npx ts-node scripts/migrate-fee-pool.ts

import * as anchor from "@coral-xyz/anchor";
import { PublicKey, Connection, Keypair } from "@solana/web3.js";
import fs from "fs";

async function main() {
  // Allow overriding RPC via env var; fall back to devnet
  const RPC =
    process.env.RPC_URL ||
    process.env.ANCHOR_PROVIDER_URL ||
    "https://api.devnet.solana.com";
  const connection = new Connection(RPC, "confirmed");

  // Load wallet from ANCHOR_WALLET or default path
  const walletPath =
    process.env.ANCHOR_WALLET || `${process.env.HOME}/.config/solana/id.json`;
  if (!fs.existsSync(walletPath)) {
    throw new Error(`wallet file not found: ${walletPath}`);
  }
  const secret = JSON.parse(fs.readFileSync(walletPath, "utf8"));
  const keypair = Keypair.fromSecretKey(new Uint8Array(secret));
  const wallet = new anchor.Wallet(keypair);

  const provider = new anchor.AnchorProvider(
    connection,
    wallet,
    anchor.AnchorProvider.defaultOptions()
  );
  anchor.setProvider(provider);
  const program = anchor.workspace.Gluex as anchor.Program;

  const programId = program.programId as PublicKey;
  const [pda, bump] = await PublicKey.findProgramAddress(
    [Buffer.from("gluex-fee-pool")],
    programId
  );

  console.log("Using program", programId.toBase58());
  console.log("FeePool PDA", pda.toBase58());

  try {
    const sig = await program.methods
      .migrateFeePool(bump)
      .accounts({ feePool: pda, initiator: provider.wallet.publicKey })
      .rpc();
    console.log("migrateFeePool tx sig:", sig);
  } catch (err) {
    console.error("migrateFeePool failed", err);
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
