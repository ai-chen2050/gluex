import { FC, useEffect, useState } from 'react';
import { PublicKey, SystemProgram } from '@solana/web3.js';
import { Program, BN } from '@coral-xyz/anchor';
import { useGlueXProgram } from '../hooks/useGlueXProgram';
import { useWallet, useConnection } from '@solana/wallet-adapter-react';
import { lamportsToSol } from '../utils/solana';

export const FeePoolPanel: FC<{ showExternal?: boolean }> = ({ showExternal = true }) => {
  const program = useGlueXProgram() as Program | null;
  const { connection } = useConnection();
  const { publicKey } = useWallet();
  const [poolPk, setPoolPk] = useState<PublicKey | null>(null);
  const [poolInfo, setPoolInfo] = useState<any | null>(null);
  const [poolExists, setPoolExists] = useState<boolean>(false);
  const [rawPoolAccount, setRawPoolAccount] = useState<any | null>(null);
  const [balance, setBalance] = useState<number>(0);
  const [num, setNum] = useState<number>(1);
  const [den, setDen] = useState<number>(1000);
  const [creating, setCreating] = useState<boolean>(false);
  // external/manual donation records (client-side only)
  const [externalDonations, setExternalDonations] = useState<Array<{ network: string; tx?: string; amount: string; currency: string; donor?: string; ts?: number }>>([]);
  const [donNet, setDonNet] = useState<string>('solana');
  const [donTx, setDonTx] = useState<string>('');
  const [donAmt, setDonAmt] = useState<string>('');
  const [donCur, setDonCur] = useState<string>('SOL');

  useEffect(() => {
    if (!program) return;
    (async () => {
      const [pda] = await PublicKey.findProgramAddress([Buffer.from('gluex-fee-pool')], program.programId);
      setPoolPk(pda);
      try {
        console.log('Fetching fee pool info for PDA', pda.toBase58());
        const info = await program.account['feePool'].fetch(pda);
        console.log('Fetched fee pool info:', info);
        setPoolInfo(info);
        setNum(info.protocolFeeNumerator.toNumber());
        setDen(info.protocolFeeDenominator.toNumber());
        setPoolExists(true);
            // populate external donations from on-chain fee pool donations
            try {
              const parseDonation = (d: any, net = 'solana') => {
                const donor = d.donor?.toBase58 ? d.donor.toBase58() : (typeof d.donor === 'string' ? d.donor : '');
                const amountRaw = d.amount ?? 0;
                const amountStr = amountRaw?.toString ? amountRaw.toString() : String(amountRaw);
                const tsRaw = d.ts ?? 0;
                const tsNum = tsRaw?.toNumber ? tsRaw.toNumber() : Number(tsRaw || 0);
                let currency = '';
                try {
                  const arr = d.currency as Uint8Array | Array<number> | Buffer;
                  if (arr) {
                    const s = new TextDecoder().decode(arr as Uint8Array).replace(/\u0000/g, '');
                    currency = s;
                  }
                } catch (err) {
                  currency = '';
                }

                // friendly display for common currencies
                let displayAmount = amountStr;
                const curLow = (currency || '').toLowerCase();
                if (curLow === 'sol' || net === 'solana' && (curLow === '' || curLow === 'sol')) {
                  // amount stored in lamports
                  const n = Number(amountStr);
                  displayAmount = isFinite(n) ? String(lamportsToSol(n)) : amountStr;
                } else if (curLow === 'eth' || curLow === 'wei' || net === 'ethereum' || net === 'base') {
                  const n = Number(amountStr);
                  displayAmount = isFinite(n) ? String(n / 1e18) : amountStr;
                }

                return { network: net, tx: '', amount: displayAmount, currency: currency || net.toUpperCase(), donor, ts: tsNum };
              };

              const list = (info.donations || []).map((d: any) => parseDonation(d, 'solana'));
              setExternalDonations(list);
            } catch (e) {
              // ignore mapping errors
            }
      } catch (e) {
        console.error('Failed to fetch fee pool info:', e);
        setPoolInfo(null);
        // account may exist but decoding failed (IDL mismatch / different struct)
        try {
          const acct = await connection.getAccountInfo(pda).catch(() => null);
          setPoolExists(!!acct);
          setRawPoolAccount(acct);
        } catch (_) {
          setPoolExists(false);
        }
      }
      const bal = await connection.getBalance(pda).catch(() => 0);
      setBalance(bal);
    })();
  }, [program, connection]);

  const onCreatePool = async () => {
    if (!program || !poolPk || !publicKey) return;
    // if account exists, do not attempt to create (would fail)
    if (poolExists) {
      console.warn('Fee pool account already exists; skipping create.');
      // If we've already decoded the account into `poolInfo`, nothing else to do.
      if (poolInfo) return;

      // Avoid calling `program.account['feePool'].fetch` here because if the on-chain
      // account layout differs from the current IDL, Anchor will throw a low-level
      // RangeError (trying to access beyond buffer length). Instead surface a
      // clear diagnostic and show raw account info length to aid migration.
      console.error('Existing fee pool account could not be decoded with current IDL. This likely means the deployed on-chain account layout differs from the current IDL (program was changed).');
      try {
        const acct = rawPoolAccount || (await connection.getAccountInfo(poolPk).catch(() => null));
        const len = acct?.data?.length ?? 0;
        console.error(`Raw account data length: ${len}. If non-zero, consider migrating or recreating the fee pool account to match the current program layout.`);
      } catch (e) {
        // ignore
      }
      return;
    }
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

  // Build fee pool content to avoid inline IIFE inside JSX which can cause parsing issues
  const feePoolContent = poolInfo ? (
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
          <div className="flex items-center justify-between gap-4">
            <div>
              <div className="text-xs text-slate-400">Founder</div>
              <div className="text-slate-200 font-mono text-sm truncate max-w-full">{poolInfo.founder.toBase58()}</div>
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
              <div className="bg-amber-400 h-3 flex items-center justify-center text-black text-[11px] font-semibold" style={{ width: `${n === 0 ? 100 : 50}%` }}>
                Founder {n === 0 ? '100%' : '50%'}
              </div>
              <div className="bg-emerald-400 h-3 flex items-center justify-center text-black text-[11px] font-semibold" style={{ width: `${n === 0 ? 0 : 50}%` }}>
                Contributors {n === 0 ? '' : `50% (${n} total)`}
              </div>
            </div>
            <div className="flex gap-2 items-center mt-2 flex-wrap">
              {(poolInfo.maintainers || []).slice(0, 5).map((m: any, i: number) => (
                <div key={i} className="px-2 py-1 bg-slate-800 rounded text-xs text-slate-200 font-mono truncate">{String(m).slice(0, 6)}...{String(m).slice(-6)}</div>
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
  );

  return (
    <div className="w-full space-y-4">
      {showExternal && (
        <div className="w-full overflow-hidden rounded-2xl sm:rounded-3xl border border-indigo-500/20 bg-gradient-to-br from-slate-950/60 to-slate-900/40 backdrop-blur-md p-5 sm:p-6 space-y-4 sm:space-y-5 shadow-[0_10px_40px_rgba(79,70,229,0.1)] hover:shadow-[0_20px_60px_rgba(136,58,255,0.2)] transition-all duration-300">
          <h3 className="text-lg sm:text-xl font-bold text-white">External / Manual Donations</h3>
          <div className="mt-4 border-t border-slate-800 pt-4 text-sm text-slate-300">
            <div className="flex items-center justify-between">
              <div className="text-xs text-slate-400">Add donations outside devnet contract</div>
            </div>

            <div className="mt-3 grid grid-cols-1 gap-2">
              <div className="flex gap-2">
                <select className="input input-sm bg-slate-800 text-white w-28" value={donNet} onChange={(e) => setDonNet(e.target.value)}>
                  <option value="solana">Solana</option>
                  <option value="ethereum">Ethereum</option>
                  <option value="base">Base</option>
                  <option value="other">Other</option>
                </select>
                <input className="input input-sm bg-slate-800 text-white flex-1" placeholder="tx hash / signature" value={donTx} onChange={(e) => setDonTx(e.target.value)} />
                <input className="input input-sm bg-slate-800 text-white w-24" placeholder="amount" value={donAmt} onChange={(e) => setDonAmt(e.target.value)} />
                <input className="input input-sm bg-slate-800 text-white w-20" placeholder="currency" value={donCur} onChange={(e) => setDonCur(e.target.value)} />
                <button
                  className="btn btn-sm bg-gradient-to-r from-indigo-500 to-fuchsia-500 text-white"
                  onClick={async () => {
                    if (!donTx || !donAmt) return;
                    // if on-chain program is available, record donation on-chain
                    try {
                      if (program && poolPk && publicKey) {
                        // convert amount to smallest unit depending on network
                        let amountUnits = BigInt(0);
                        if (donNet === 'solana') {
                          amountUnits = BigInt(Math.floor(Number(donAmt) * 1e9));
                        } else if (donNet === 'ethereum' || donNet === 'base') {
                          // store wei
                          amountUnits = BigInt(Math.floor(Number(donAmt) * 1e18));
                        } else {
                          amountUnits = BigInt(Math.floor(Number(donAmt)));
                        }
                        await program.methods
                          .addDonation(new BN(amountUnits.toString()), donCur)
                          .accounts({ feePool: poolPk, donor: publicKey })
                          .rpc();

                        // refresh fee pool info
                        const info = await program.account['feePool'].fetch(poolPk);
                        setPoolInfo(info);
                        const bal = await connection.getBalance(poolPk).catch(() => 0);
                        setBalance(bal);

                        // update client-side external list from on-chain donations
                        const parseDonation = (d: any, net = donNet) => {
                          const donor = d.donor?.toBase58 ? d.donor.toBase58() : (typeof d.donor === 'string' ? d.donor : '');
                          const amountRaw = d.amount ?? 0;
                          const amountStr = amountRaw?.toString ? amountRaw.toString() : String(amountRaw);
                          const tsRaw = d.ts ?? 0;
                          const tsNum = tsRaw?.toNumber ? tsRaw.toNumber() : Number(tsRaw || 0);
                          let currency = '';
                          try {
                            const arr = d.currency as Uint8Array | Array<number> | Buffer;
                            if (arr) {
                              const s = new TextDecoder().decode(arr as Uint8Array).replace(/\u0000/g, '');
                              currency = s;
                            }
                          } catch (err) { currency = ''; }
                          let displayAmount = amountStr;
                          const curLow = (currency || '').toLowerCase();
                          if (curLow === 'sol' || net === 'solana' && (curLow === '' || curLow === 'sol')) {
                            const n = Number(amountStr);
                            displayAmount = isFinite(n) ? String(lamportsToSol(n)) : amountStr;
                          } else if (curLow === 'eth' || curLow === 'wei' || net === 'ethereum' || net === 'base') {
                            const n = Number(amountStr);
                            displayAmount = isFinite(n) ? String(n / 1e18) : amountStr;
                          }
                          return { network: net, tx: '', amount: displayAmount, currency: currency || net.toUpperCase(), donor, ts: tsNum };
                        };

                        const list = (info.donations || []).map((d: any) => parseDonation(d, donNet));
                        setExternalDonations((s) => [...list, ...s]);
                        setDonTx('');
                        setDonAmt('');
                        return;
                      }
                    } catch (err) {
                      console.error('addDonation failed', err);
                    }

                    // fallback: client-side only
                    setExternalDonations((s) => [{ network: donNet, tx: donTx, amount: donAmt, currency: donCur }, ...s]);
                    setDonTx('');
                    setDonAmt('');
                  }}
                >
                  Add
                </button>
              </div>

              <div className="text-xs text-slate-400">These entries are stored client-side for now; they can be used to display totals and later backed by on-chain records or a simple backend.</div>

              <div className="space-y-2">
                {(externalDonations.length === 0) ? (
                  <div className="text-slate-500">No external donations recorded yet.</div>
                ) : (
                  externalDonations.map((d, i) => (
                    <div key={i} className="flex items-center justify-between bg-slate-900/30 p-2 rounded min-w-0">
                      <div className="text-xs min-w-0">
                        <div className="font-mono text-slate-200 truncate max-w-full">{d.tx || d.donor}</div>
                        <div className="text-slate-400">{d.network} • {d.amount} {d.currency}</div>
                        {d.ts ? <div className="text-xs text-slate-500">{new Date(d.ts * 1000).toLocaleString()}</div> : null}
                      </div>
                      <div className="text-right">
                        <a className="text-indigo-300 text-xs" href={d.network === 'solana' ? `https://solscan.io/tx/${d.tx}` : `https://etherscan.io/tx/${d.tx}`} target="_blank" rel="noreferrer">View</a>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Simple totals */}
              {externalDonations.length > 0 && (
                <div className="mt-3 text-xs text-slate-400">
                  <div className="font-semibold text-slate-200">Manual totals</div>
                  {(() => {
                    const totals: Record<string, number> = {};
                    externalDonations.forEach((d) => {
                      const key = d.currency || d.network;
                      const v = Number(d.amount) || 0;
                      totals[key] = (totals[key] || 0) + v;
                    });
                    return Object.keys(totals).map((k) => (
                      <div key={k} className="flex items-center justify-between">
                        <div className="text-xs text-slate-400">{k}</div>
                        <div className="text-xs text-slate-200">{totals[k]}</div>
                      </div>
                    ));
                  })()}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Fee Pool card */}
      <div className="w-full overflow-hidden rounded-2xl sm:rounded-3xl border border-indigo-500/20 bg-gradient-to-br from-slate-950/60 to-slate-900/40 backdrop-blur-md p-5 sm:p-6 space-y-4 sm:space-y-5 shadow-[0_10px_40px_rgba(79,70,229,0.1)] hover:shadow-[0_20px_60px_rgba(136,58,255,0.2)] transition-all duration-300">
        <h3 className="text-lg sm:text-xl font-bold text-white">Fee Pool</h3>
        {feePoolContent}
      </div>
    </div>
  );
};

export default FeePoolPanel;
