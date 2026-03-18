import { FC, useEffect, useState } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import * as web3 from '@solana/web3.js';
import BN from 'bn.js';
import { useGlueXProgram } from '../hooks/useGlueXProgram';

export const BountyBoard: FC = () => {
  const wallet = useWallet();
  const program = useGlueXProgram();
  const [bounties, setBounties] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchBounties = async () => {
    if (!program) return;
    try {
      const allBounties = await (program as any).account.openBounty.all();
      setBounties(allBounties);
    } catch (e) {
      console.error("Failed to fetch bounties", e);
    }
  };

  useEffect(() => {
    fetchBounties();
  }, [program]);

  const handlePublishBounty = async () => {
    if (!wallet.publicKey || !program) return;
    setLoading(true);
    try {
      const bountyId = new BN(Math.floor(Date.now() / 1000));
      const [bountyPda] = web3.PublicKey.findProgramAddressSync(
        [
          Buffer.from("open-bounty"), 
          wallet.publicKey.toBuffer(), 
          Buffer.from(bountyId.toArray("le", 8))
        ],
        program.programId
      );

      await program.methods
        .publishBounty(
          bountyId,
          "New Open Bounty Target",
          "Requirements string",
          new BN(100000000), // 0.1 SOL
          new BN(Math.floor(Date.now() / 1000) + 86400),
          1 // max claims
        )
        .accounts({
          openBounty: bountyPda,
          issuer: wallet.publicKey,
          systemProgram: web3.SystemProgram.programId,
        })
        .rpc();
        
      await fetchBounties();
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleClaim = async (bountyPda: web3.PublicKey, issuerKey: string) => {
    if (!wallet.publicKey || !program) return;
    try {
      const [bountyExecPda] = web3.PublicKey.findProgramAddressSync(
        [Buffer.from("bounty-exec"), bountyPda.toBuffer(), wallet.publicKey.toBuffer()],
        program.programId
      );

      await program.methods
        .claimBounty()
        .accounts({
          openBounty: bountyPda,
          bountyExecution: bountyExecPda,
          taker: wallet.publicKey,
          systemProgram: web3.SystemProgram.programId,
        })
        .rpc();
        
      fetchBounties();
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-indigo-400">
          Open Bounties
        </h2>
        <button
          onClick={handlePublishBounty}
          disabled={!wallet.publicKey || loading}
          className="btn btn-sm sm:btn-md bg-slate-800 text-white hover:bg-slate-700 border-indigo-500/30"
        >
          {loading ? "Publishing..." : "+ New Demo Bounty"}
        </button>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {bounties.map((b) => (
          <div key={b.publicKey.toBase58()} className="rounded-xl border border-indigo-500/20 bg-slate-900/60 p-5 space-y-3 hover:border-indigo-500/50 transition-all shadow-md">
            <div className="flex justify-between items-start">
              <h4 className="text-lg font-bold text-white">{b.account.description}</h4>
              <span className="bg-indigo-500/20 text-indigo-300 text-xs px-2 py-1 rounded">
                {(b.account.incentiveAmount.toNumber() / 1e9).toFixed(2)} SOL
              </span>
            </div>
            <p className="text-sm text-slate-400">Issuer: {b.account.issuer.toBase58().slice(0, 8)}...</p>
            <div className="flex justify-between items-center mt-4">
              <span className="text-xs text-slate-500">
                Claims: {b.account.currentClaims} / {b.account.maxClaims}
              </span>
              <button
                onClick={() => handleClaim(b.publicKey, b.account.issuer.toBase58())}
                disabled={!wallet.publicKey || b.account.currentClaims >= b.account.maxClaims || b.account.issuer.toBase58() === wallet.publicKey.toBase58()}
                className="btn btn-xs sm:btn-sm border-0 bg-gradient-to-r from-indigo-500/80 to-purple-500/80 hover:from-indigo-500 hover:to-purple-500 text-white"
              >
                Claim Task
              </button>
            </div>
          </div>
        ))}
        {bounties.length === 0 && (
           <p className="text-slate-500 text-center col-span-2 py-8">No open bounties at the moment.</p>
        )}
      </div>
    </div>
  );
};
