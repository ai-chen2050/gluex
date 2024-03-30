import * as anchor from "@project-serum/anchor";
import { BN, IdlTypes, Program } from "@project-serum/anchor";
import { Gluex } from "../target/types/gluex";
import { it } from "mocha";

export type IdlSubGoal = IdlTypes<Gluex>["SubGoal"];
export type IdlRoomspace = IdlTypes<Gluex>["Roomspace"];
export type IdlRelations = IdlTypes<Gluex>["Relations"];
export type IdlEventType = IdlTypes<Gluex>["EventType"];

describe("gluex", () => {
  // Configure the client to use the local cluster.
  anchor.setProvider(anchor.AnchorProvider.env());

  const program = anchor.workspace.Gluex as Program<Gluex>;

  it("Setup goal!", async () => {
    // Add your test here.
    const payer = (program.provider as anchor.AnchorProvider).wallet
    const goalKeypair = anchor.web3.Keypair.generate()
    const taker = anchor.web3.Keypair.generate()
    
    const sgoal = { description: [1,0,1,0,1,1,0,1,0,1,1,0,1,0,1,1,0,1,0,1], deadline: new BN(1711810988), incentiveAmount: new BN(1), completed: false };
    const subgoal: [IdlSubGoal, IdlSubGoal, IdlSubGoal] = [ sgoal, sgoal, sgoal]
    const tx = await program.methods.setupGoal(
      taker.publicKey, "first test", { ["LoveGame"]: {} } as never, { ["Parents"]: {} } as never, { ["HabitTraning"]: {} } as never, subgoal, new BN(1), new BN(1711810988), new BN(1), new BN(1711810988)
    ).accounts({
      goals: goalKeypair.publicKey, 
      payer: payer.publicKey
    })
    .rpc();
    console.log("Your transaction signature", tx);
    
    let goalState = await program.account.totalGoal.fetch(goalKeypair.publicKey)
    console.log("Your new one goals is ", goalState);
  });

});
