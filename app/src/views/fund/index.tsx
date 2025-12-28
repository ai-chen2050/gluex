import { FC, useCallback, useState } from 'react';
import Link from 'next/link';
import FeePoolPanel from '../../components/FeePoolPanel';
import { useLanguage } from '../../contexts/LanguageProvider';
import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { PublicKey, SystemProgram, TransactionMessage, VersionedTransaction } from '@solana/web3.js';
import { notify } from '../../utils/notifications';

const ADDR_SOLANA = 'FP7mce6Z7i729vLKJPbCCDWUZx7Gb4271BUCJ7xFeAuw';
const ADDR_ETH = '0x2620e16388b7673e96d7e78dab9de51c2bb2523e';

const copy = {
  en: {
    title: 'Fundraising',
    subtitle: 'Support GlueX development — on-chain donations and fee pool transparency.',
    intro:
      'Thank you for supporting GlueX. Below are donation addresses for mainnets. Current smart contract is deployed on Solana devnet; donations to mainnets can be recorded manually for future reconciliation.',
    donateNow: 'Donate',
    noteTitle: 'Notes',
    notes:
      'Protocol fees collected by GlueX fund the project. In future distributions at least 15% of raised funds will be shared with early donors as profit-sharing rewards.',
    networksTitle: 'Mainnet donation addresses',
    solLabel: 'Solana (mainnet) address',
    ethLabel: 'Ethereum / Base (mainnet) address',
    recordTitle: 'Manual donation records',
    recordHelp: 'If you donated on another chain, add the transaction hash and amount as follows so we can show totals publicly.',
  },
  zh: {
    title: '募捐支持',
    subtitle: '支持 GlueX 开发 — 链上捐款与手续费池透明展示。',
    intro:
      '感谢你的支持。下面列出主网捐赠地址。当前合约仅部署在 Solana 开发网，主网捐赠可在此手动登记以便后续对账。',
    donateNow: '立即捐赠',
    noteTitle: '说明',
    notes:
      'GlueX 协议手续费用于项目发展。未来分配中至少会保留 15% 用于早期捐赠者的分红奖励。',
    networksTitle: '主网捐赠地址',
    solLabel: 'Solana（主网）地址',
    ethLabel: 'Ethereum / Base（主网）地址',
    recordTitle: '手动捐赠记录',
    recordHelp: '若你已在其他链上捐赠，请在下面填写交易哈希与金额，以便我们公开展示总额。',
  },
};

export const FundraiseView: FC = () => {
  const { language } = useLanguage();
  const t = copy[language];
  const [copied, setCopied] = useState<string | null>(null);
  const [externalDonations, setExternalDonations] = useState<Array<{ network: string; tx: string; amount: string; currency: string }>>([]);
  const [donNet, setDonNet] = useState<string>('solana');
  const [donTx, setDonTx] = useState<string>('');
  const [donAmt, setDonAmt] = useState<string>('1');
  const [donCur, setDonCur] = useState<string>('SOL');

  const doCopy = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(text);
      setTimeout(() => setCopied(null), 2000);
    } catch (e) {
      // ignore
    }
  };

  const { connection } = useConnection();
  const { publicKey, sendTransaction } = useWallet();

  const sendSolDonation = useCallback(async (toAddr: string) => {
    if (!publicKey) {
      notify({ type: 'error', message: 'Wallet not connected!' });
      return;
    }
    if (!donAmt) {
      notify({ type: 'error', message: 'Enter amount first' });
      return;
    }
    const lamports = Math.floor(Number(donAmt) * 1e9);
    if (isNaN(lamports) || lamports <= 0) {
      notify({ type: 'error', message: 'Invalid amount' });
      return;
    }

    try {
      const toPub = new PublicKey(toAddr);

      const instructions = [
        SystemProgram.transfer({ fromPubkey: publicKey, toPubkey: toPub, lamports }),
      ];

      const latestBlockhash = await connection.getLatestBlockhash();

      const messageLegacy = new TransactionMessage({
        payerKey: publicKey,
        recentBlockhash: latestBlockhash.blockhash,
        instructions,
      }).compileToLegacyMessage();

      const tx = new VersionedTransaction(messageLegacy);

      const sig = await sendTransaction(tx, connection);
      await connection.confirmTransaction({ signature: sig, ...latestBlockhash }, 'confirmed');
      notify({ type: 'success', message: 'Donation sent!', txid: sig });
    } catch (err: any) {
      notify({ type: 'error', message: 'Donation failed', description: err?.message });
    }
  }, [publicKey, sendTransaction, connection]);

  const sendEthDonation = useCallback(async (toAddr: string) => {
    const ethereum = (window as any).ethereum;
    if (!ethereum) {
      notify({ type: 'error', message: 'No Ethereum provider found' });
      return;
    }
    if (!donAmt) {
      notify({ type: 'error', message: 'Enter amount first' });
      return;
    }
    const wei = BigInt(Math.floor(Number(donAmt) * 1e18));
    if (wei <= 0) {
      notify({ type: 'error', message: 'Invalid amount' });
      return;
    }

    try {
      const accounts = await ethereum.request({ method: 'eth_requestAccounts' });
      const from = accounts[0];
      const value = '0x' + wei.toString(16);
      const txParams = { from, to: toAddr, value };
      const txHash = await ethereum.request({ method: 'eth_sendTransaction', params: [txParams] });
      notify({ type: 'success', message: 'Donation sent!', txid: txHash });
    } catch (err: any) {
      notify({ type: 'error', message: 'Donation failed', description: err?.message });
    }
  }, [donAmt]);

  return (
    <div className="mx-auto max-w-6xl px-4 py-12 space-y-8">
      <section className="rounded-2xl border border-indigo-500/30 bg-gradient-to-br from-indigo-900/40 to-fuchsia-900/20 p-8 text-center space-y-4">
        <h1 className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 to-fuchsia-500">{t.title}</h1>
        <p className="text-lg text-slate-300 max-w-3xl mx-auto">{t.subtitle}</p>
        <p className="text-sm text-slate-400 max-w-3xl mx-auto">{t.intro}</p>
      </section>

      <section className="grid md:grid-cols-2 gap-6">
        <div className="rounded-2xl border border-indigo-500/20 bg-gradient-to-br from-slate-950/60 to-slate-900/40 p-6 space-y-4">
          <h2 className="text-2xl font-semibold text-white">{t.networksTitle}</h2>
          <div className="space-y-3 text-sm text-slate-300">
            <div className="flex flex-col bg-slate-900/40 p-3 rounded">
              <div>
                <div className="text-xs text-slate-400">{t.solLabel}</div>
                <div className="font-mono text-slate-200 break-words">{ADDR_SOLANA}</div>
              </div>
              <div className="mt-3 flex items-center justify-end gap-3">
                <input
                  type="number"
                  step="any"
                  min="0"
                  placeholder="amount"
                  value={donAmt}
                  onChange={(e) => setDonAmt(e.target.value)}
                  className="input input-sm w-24 bg-slate-800 text-white placeholder-slate-400 border border-slate-700 focus:outline-none"
                />
                <button className="btn btn-sm px-3 py-1 bg-gradient-to-r from-indigo-500 to-fuchsia-500 text-white" onClick={() => sendSolDonation(ADDR_SOLANA)}>{t.donateNow}</button>
              </div>
            </div>

            <div className="flex flex-col bg-slate-900/40 p-3 rounded">
              <div>
                <div className="text-xs text-slate-400">{t.ethLabel}</div>
                <div className="font-mono text-slate-200 break-words">{ADDR_ETH}</div>
              </div>
              <div className="mt-3 flex items-center justify-end gap-3">
                <input
                  type="number"
                  step="any"
                  min="0"
                  placeholder="amount"
                  value={donAmt}
                  onChange={(e) => setDonAmt(e.target.value)}
                  className="input input-sm w-24 bg-slate-800 text-white placeholder-slate-400 border border-slate-700 focus:outline-none"
                />
                <button className="btn btn-sm px-3 py-1 bg-gradient-to-r from-indigo-500 to-fuchsia-500 text-white" onClick={() => sendEthDonation(ADDR_ETH)}>{t.donateNow}</button>
              </div>
            </div>

            <div className="text-xs text-slate-400">{t.notes}</div>
          </div>
        </div>

        <div className="rounded-2xl border border-indigo-500/20 bg-gradient-to-br from-slate-950/60 to-slate-900/40 p-6 space-y-4">
          <h2 className="text-2xl font-semibold text-white">{t.recordTitle}</h2>
          <p className="text-xs text-slate-400">{t.recordHelp}</p>
          <div className="mt-2 border-t border-slate-800 pt-4 text-sm text-slate-300">
            <div className="mt-3 grid grid-cols-1 gap-2">
              <div className="space-y-2">
                {(externalDonations.length === 0) ? (
                  <div className="text-slate-500">No external donations recorded yet.</div>
                ) : (
                  externalDonations.map((d, i) => (
                    <div key={i} className="flex items-center justify-between bg-slate-900/30 p-2 rounded min-w-0">
                      <div className="text-xs min-w-0">
                        <div className="font-mono text-slate-200 truncate max-w-full">{d.tx}</div>
                        <div className="text-slate-400">{d.network} • {d.amount} {d.currency}</div>
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
      </section>

      {/* Fee Pool displayed on its own row under donation info and manual records */}
      <section className="mt-6">
        <FeePoolPanel showExternal={true} />
      </section>

      <section className="rounded-2xl border border-indigo-500/20 bg-gradient-to-br from-fuchsia-950/30 to-indigo-950/20 p-6 text-center">
        <h1 className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 to-fuchsia-500">{t.noteTitle}</h1>
        <br />
        <p className="text-lg text-slate-300 max-w-3xl mx-auto">{t.notes}</p>
      </section>
    </div>
  );
};

export default FundraiseView;
