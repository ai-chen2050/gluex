import * as anchor from "@project-serum/anchor";
import { Program } from "@project-serum/anchor";
import { Glueu } from "../target/types/glueu";

describe("glueu", () => {
  // Configure the client to use the local cluster.
  anchor.setProvider(anchor.AnchorProvider.env());

  const program = anchor.workspace.Glueu as Program<Glueu>;

  it("Is initialized!", async () => {
    // Add your test here.
    const tx = await program.methods.initialize().rpc();
    console.log("Your transaction signature", tx);
  });
});
