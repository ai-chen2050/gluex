import { FC, useEffect, useState } from 'react';
import { PublicKey, SystemProgram } from '@solana/web3.js';
import { Program, BN } from '@coral-xyz/anchor';
import { useGlueXProgram } from '../hooks/useGlueXProgram';
import { useWallet, useConnection } from '@solana/wallet-adapter-react';
import { lamportsToSol } from '../utils/solana';

export const FeePoolPanel: FC = () => {
  const program = useGlueXProgram() as Program | null;
  const { connection } = useConnection();
  const { publicKey } = useWallet();
  const [poolPk, setPoolPk] = useState<PublicKey | null>(null);
  const [poolInfo, setPoolInfo] = useState<any | null>(null);
  const [balance, setBalance] = useState<number>(0);
  const [num, setNum] = useState<number>(1);
  const [den, setDen] = useState<number>(1000);
  const [creating, setCreating] = useState<boolean>(false);

  useEffect(() => {
    if (!program) return;
    (async () => {
      const [pda] = await PublicKey.findProgramAddress([Buffer.from('gluex-fee-pool')], program.programId);
      setPoolPk(pda);
      try {
        const info = await program.account['feePool'].fetch(pda);
        setPoolInfo(info);
        setNum(info.protocolFeeNumerator.toNumber());
        setDen(info.protocolFeeDenominator.toNumber());
      } catch (e) {
        setPoolInfo(null);
      }
      const bal = await connection.getBalance(pda).catch(() => 0);
      setBalance(bal);
    })();
  }, [program, connection]);

  const onCreatePool = async () => {
    if (!program || !poolPk || !publicKey) return;
    setCreating(true);
    try {
      await program.methods
        .createFeePool(publicKey)
        .accounts({ feePool: poolPk, payer: publicKey, systemProgram: SystemProgram.programId })
        .rpc();

      const info = await program.account['feePool'].fetch(poolPk);
      setPoolInfo(info);
      const bal = await connection.getBalance(poolPk).catch(() => 0);
      setBalance(bal);
    } catch (err) {
      console.error('create fee pool error', err);
    } finally {
      setCreating(false);
    }
  };

  const isFounder = !!(poolInfo && publicKey && poolInfo.founder.equals(publicKey));

  const onSetFee = async () => {
    if (!program || !poolPk || !publicKey) return;
    await program.methods.setFeeParams(new BN(num), new BN(den)).accounts({ feePool: poolPk, founder: publicKey }).rpc();
    const info = await program.account['feePool'].fetch(poolPk);
    setPoolInfo(info);
  };

  const onDistribute = async () => {
    if (!program || !poolPk || !publicKey) return;
    const remaining = (poolInfo?.maintainers || []).map((m: any) => ({ pubkey: new PublicKey(m), isWritable: true, isSigner: false }));
    await program.methods.distributeFees().accounts({ feePool: poolPk, founderDest: publicKey }).remainingAccounts(remaining).rpc();
  };

  return (
    <div className="rounded-2xl sm:rounded-3xl border border-indigo-500/20 bg-gradient-to-br from-slate-950/60 to-slate-900/40 backdrop-blur-md p-5 sm:p-6 space-y-4 sm:space-y-5 shadow-[0_10px_40px_rgba(79,70,229,0.1)] hover:shadow-[0_20px_60px_rgba(136,58,255,0.2)] transition-all duration-300">
      <h3 className="text-lg sm:text-xl font-bold text-white">Fee Pool</h3>
      {poolInfo ? (
        (() => {
          const n = (poolInfo.maintainers || []).length as number;
          const total = BigInt(balance || 0);
          let founderShare = BigInt(0);
          let maintSharePer = BigInt(0);
          if (n === 0) {
            founderShare = total;
          } else if (n === 1) {
            founderShare = total / BigInt(2);
            maintSharePer = total - founderShare;
          } else {
            founderShare = total / BigInt(2);
            const contributorPool = total - founderShare;
            maintSharePer = contributorPool / BigInt(n);
          }

          const feePercent = poolInfo.protocolFeeNumerator.toNumber() / poolInfo.protocolFeeDenominator.toNumber();
          const poolSol = lamportsToSol(Number(total));

          return (
            <div className="mt-1 space-y-3 text-sm text-slate-300">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-xs text-slate-400">Founder</div>
                  <div className="text-slate-200 font-mono text-sm">{poolInfo.founder.toBase58()}</div>
                </div>
                <div className="text-right">
                  <div className="text-xs text-slate-400">Pool Balance</div>
                  <div className="text-slate-200 font-semibold">{poolSol} SOL <span className="text-slate-500">({balance} lamports)</span></div>
                </div>
              </div>

              <div className="space-y-1">
                <div className="flex items-center justify-between text-xs text-slate-400">
                  <div>Protocol fee</div>
                  <div className="text-slate-200">{(feePercent * 100).toFixed(2)}%</div>
                </div>
                <div className="w-full bg-slate-800 h-2 rounded overflow-hidden">
                  <div className="h-2 bg-gradient-to-r from-indigo-500 to-fuchsia-500" style={{ width: `${Math.min(100, feePercent * 100)}%` }} />
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs text-slate-400">
                  <div>Progressive fee sharing</div>
                  <div className="text-slate-200">{n} maintainer{n !== 1 ? 's' : ''}</div>
                </div>
                <div className="w-full bg-slate-800 h-3 rounded flex overflow-hidden">
                  {/* founder portion */}
                  <div className="bg-amber-400 h-3 flex items-center justify-center text-black text-[11px] font-semibold" style={{ width: `${n === 0 ? 100 : 50}%` }}>
                    Founder {n === 0 ? '100%' : '50%'}
                  </div>
                  {/* maintainers portion */}
                  <div className="bg-emerald-400 h-3 flex items-center justify-center text-black text-[11px] font-semibold" style={{ width: `${n === 0 ? 0 : 50}%` }}>
                    Contributors {n === 0 ? '' : `50% (${n} total)`}
                  </div>
                </div>
                <div className="flex gap-2 items-center mt-2">
                  {(poolInfo.maintainers || []).slice(0, 5).map((m: any, i: number) => (
                    <div key={i} className="px-2 py-1 bg-slate-800 rounded text-xs text-slate-200 font-mono">{String(m).slice(0, 6)}...{String(m).slice(-6)}</div>
                  ))}
                  {((poolInfo.maintainers || []).length > 5) && <div className="text-xs text-slate-400">+{(poolInfo.maintainers || []).length - 5} more</div>}
                </div>
              </div>

              {isFounder && (
                <div className="space-y-2 pt-2">
                  <div className="flex gap-2 items-center">
                    <input className="input input-sm bg-slate-800 text-white w-20" value={num} onChange={(e) => setNum(Number(e.target.value))} />
                    <span className="text-slate-400">/</span>
                    <input className="input input-sm bg-slate-800 text-white w-32" value={den} onChange={(e) => setDen(Number(e.target.value))} />
                    <button className="btn btn-sm ml-2 bg-gradient-to-r from-fuchsia-500 to-rose-500 text-white" onClick={onSetFee}>Set Fee</button>
                    <div className="text-xs text-slate-400 ml-2">Set protocol fee numerator/denominator. Example: 1/1000 = 0.1%</div>
                  </div>
                  <div className="flex gap-2 items-center">
                    <button className="btn btn-sm bg-gradient-to-r from-indigo-500 to-fuchsia-500 text-white" onClick={onDistribute}>Distribute</button>
                    <div className="text-xs text-slate-400 ml-2">Distribute pool funds: founder receives 50% (if contributors exist), remaining split among maintainers.</div>
                  </div>
                </div>
              )}
            </div>
          );
        })()
      ) : (
        <div className="mt-3 text-sm text-slate-400 space-y-2">
          <div>Fee pool not created yet.</div>
          <div className="flex gap-2">
            <button
              className="btn btn-sm bg-gradient-to-r from-indigo-500 to-fuchsia-500 text-white"
              onClick={onCreatePool}
              disabled={!publicKey || !program || creating}
            >
              {creating ? 'Creating...' : 'Create Fee Pool'}
            </button>
            {!publicKey && <div className="text-xs text-rose-400">Connect wallet to create</div>}
          </div>
        </div>
      )}
    </div>
  );
};

export default FeePoolPanel;
