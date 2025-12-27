import * as anchor from "@coral-xyz/anchor";
import { AnchorProvider, Idl, Program } from "@coral-xyz/anchor";
import oldidl from "../idl/gluex-old.json";
import newidl from "../idl/gluex.json";

// Fetch all TotalGoal accounts and decode them using the appropriate IDL.
// New accounts (with id and version fields) are decoded with gluex.json (new IDL).
// Old accounts (without id and version fields) are decoded with gluex-old.json (old IDL).
export async function fetchAllTotalGoals(program: anchor.Program) {
  if (!program) return [];

  const connection = program.provider.connection;
  const pid = program.programId;

  // Load old IDL for decoding legacy accounts
  let oldProgram: anchor.Program | null = null;
  try {
    oldProgram = new anchor.Program(oldidl as Idl, program.provider);
  } catch (e) {
    console.warn("old IDL not available, fallback decode will be skipped", e);
    // Continue execution even if old IDL fails - we can still decode new accounts
  }

  // Get discriminator for TotalGoal account type from IDL
  // The discriminator is the same for both old and new IDL since the account type name is the same
  let discriminator: Uint8Array | null = null;
  try {
    const idl = newidl as any;
    const totalGoalAccount = idl.accounts?.find(
      (acc: any) => acc.name === "TotalGoal"
    );
    if (totalGoalAccount?.discriminator) {
      discriminator = Uint8Array.from(totalGoalAccount.discriminator);
    }
  } catch (e) {
    console.warn("Failed to get discriminator from IDL", e);
    return [];
  }

  if (!discriminator) {
    console.warn("Discriminator not available");
    return [];
  }

  // Helper function to compare Uint8Arrays
  const arraysEqual = (a: Uint8Array, b: Uint8Array): boolean => {
    if (a.length !== b.length) return false;
    for (let i = 0; i < a.length; i++) {
      if (a[i] !== b[i]) return false;
    }
    return true;
  };

  // Fetch all program accounts
  const rawList = await connection.getProgramAccounts(pid as any);
  const out: Array<any> = [];

  console.log(
    `Fetched ${rawList.length} accounts for program ${pid.toBase58()}`
  );

  // Process each account
  for (const ent of rawList) {
    const pubkey = ent.pubkey;
    // ent.account.data is already a Buffer, convert to Uint8Array for comparison
    const accountData =
      ent.account.data instanceof Buffer
        ? ent.account.data
        : Buffer.from(ent.account.data as Uint8Array);
    const data = accountData;

    // Check if this is a TotalGoal account by verifying the discriminator
    const header = new Uint8Array(data.slice(0, 8));
    if (!arraysEqual(header, discriminator)) {
      continue; // Skip non-TotalGoal accounts
    }

    // Try to decode with new IDL first (for accounts with id and version fields)
    // Note: Anchor converts PascalCase struct names to camelCase in the coder
    let decoded: any = null;

    try {
      decoded = program.coder.accounts.decode("totalGoal", data);
      out.push({ publicKey: pubkey, account: decoded });
      continue; // Successfully decoded with new IDL, move to next account
    } catch (e: any) {
      // If decoding fails (likely due to "access beyond buffer length" error for old accounts),
      // try decoding with old IDL (for legacy accounts without id and version fields)
      if (oldProgram) {
        try {
          decoded = oldProgram.coder.accounts.decode("totalGoal", data);
          out.push({ publicKey: pubkey, account: decoded });
          continue; // Successfully decoded with old IDL, move to next account
        } catch (oldErr) {
          // Failed with both IDLs, log and skip this account
          console.warn(
            `Failed to decode account ${pubkey.toBase58()} with both new and old IDLs.`,
            `New IDL error: ${e?.message || String(e)}.`,
            `Old IDL error: ${oldErr?.message || String(oldErr)}`
          );
        }
      } else {
        // Old IDL not available, log the error and skip
        console.warn(
          `Failed to decode account ${pubkey.toBase58()} with new IDL and old IDL not available:`,
          e
        );
      }
    }
  }

  console.log(`Successfully decoded ${out.length} TotalGoal accounts`);
  return out;
}

export default fetchAllTotalGoals;
