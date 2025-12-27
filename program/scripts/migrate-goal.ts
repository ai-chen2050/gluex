import * as anchor from "@coral-xyz/anchor";
import { PublicKey, Connection, Keypair } from "@solana/web3.js";
import fs from "fs";
import BN from "bn.js";

async function main() {
  const RPC =
    process.env.RPC_URL ||
    process.env.ANCHOR_PROVIDER_URL ||
    "https://api.devnet.solana.com";
  const connection = new Connection(RPC, "confirmed");

  const walletPath =
    process.env.ANCHOR_WALLET || `${process.env.HOME}/.config/solana/id.json`;
  if (!fs.existsSync(walletPath))
    throw new Error(`wallet file not found: ${walletPath}`);
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

  const issuerStr = process.env.ISSUER || provider.wallet.publicKey.toBase58();
  const takerStr = process.env.TAKER || issuerStr;
  const goalId = Number(process.env.GOAL_ID || Math.floor(Date.now() / 1000));

  const issuer = new PublicKey(issuerStr);
  const taker = new PublicKey(takerStr);
  const goalIdBn = new BN(goalId);

  const [pda, bump] = await PublicKey.findProgramAddress(
    [
      Buffer.from("gluex-goals"),
      issuer.toBuffer(),
      taker.toBuffer(),
      Buffer.from(goalIdBn.toArray("le", 8)),
    ],
    program.programId
  );

  console.log("program:", program.programId.toBase58());
  console.log("goal PDA:", pda.toBase58(), "bump:", bump);

  try {
    // Backup existing account data (if present)
    const acct = await connection.getAccountInfo(pda);
    if (acct) {
      const backupsDir = `${process.cwd()}/migrations-backups`;
      if (!fs.existsSync(backupsDir))
        fs.mkdirSync(backupsDir, { recursive: true });
      const fname = `${backupsDir}/${pda.toBase58()}.bin`;
      fs.writeFileSync(fname, acct.data);
      console.log("Saved backup to", fname);
    } else {
      console.log(
        "No existing account data found at PDA (will create new account on setup)"
      );
    }

    const sig = await program.methods
      .migrateTotalGoal(issuer, taker, new BN(goalId), bump)
      .accounts({ goals: pda, initiator: provider.wallet.publicKey })
      .rpc();

    console.log("migrateTotalGoal tx sig:", sig);
  } catch (err) {
    console.error("migrateTotalGoal failed", err);
    process.exit(1);
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
