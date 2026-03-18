import { FC, useEffect, useState } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import * as web3 from '@solana/web3.js';
import { useGlueXProgram } from '../hooks/useGlueXProgram';
import { useLanguage } from '../contexts/LanguageProvider';

export const SocialGraphCard: FC = () => {
  const wallet = useWallet();
  const program = useGlueXProgram();
  const { language } = useLanguage();
  
  const [connections, setConnections] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let mounted = true;
    const fetchConnections = async () => {
      if (!wallet.publicKey || !program) return;
      setLoading(true);
      try {
        const allConns = await (program as any).account.socialConnection.all();
        if (!mounted) return;
        // Filter where user is either A or B
        const myConns = allConns.filter(
          (c: any) =>
            c.account.userA.toBase58() === wallet.publicKey!.toBase58() ||
            c.account.userB.toBase58() === wallet.publicKey!.toBase58()
        );
        setConnections(myConns);
      } catch (e) {
        console.error("Failed to fetch social connections", e);
      } finally {
        if (mounted) setLoading(false);
      }
    };
    fetchConnections();
    return () => { mounted = false; };
  }, [wallet.publicKey, program]);

  if (!wallet.publicKey) return null;

  return (
    <div className="w-full h-full relative group rounded-3xl border border-fuchsia-500/30 bg-gradient-to-b from-slate-900/90 to-slate-950/90 backdrop-blur-xl p-6 md:p-8 shadow-[0_10px_40px_rgba(217,70,239,0.15)] hover:shadow-[0_20px_60px_rgba(217,70,239,0.3)] transition-all duration-500 overflow-hidden">
      {/* Decorative background Elements */}
      <div className="absolute -top-10 -right-10 w-40 h-40 bg-pink-500/10 rounded-full blur-3xl pointer-events-none group-hover:bg-pink-500/20 transition-all duration-700"></div>
      <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-fuchsia-500/10 rounded-full blur-3xl pointer-events-none group-hover:bg-fuchsia-500/20 transition-all duration-700"></div>

      <div className="flex items-center justify-between mb-6 relative z-10">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-fuchsia-500/20 to-pink-500/20 flex items-center justify-center text-fuchsia-400 border border-fuchsia-500/30 shadow-inner">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-7 h-7">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
            </svg>
          </div>
          <div>
            <h3 className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-fuchsia-300 via-pink-300 to-rose-300">
              {language === "en" ? "Social Graph" : "社交关系地图"}
            </h3>
            <p className="text-xs text-fuchsia-400/80 font-mono tracking-widest uppercase mt-0.5">Network Grid</p>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center p-8 relative z-10">
          <span className="loading loading-bars loading-md text-fuchsia-500"></span>
        </div>
      ) : connections.length === 0 ? (
        <div className="text-center p-8 border border-dashed border-fuchsia-500/30 rounded-2xl bg-fuchsia-500/5 relative z-10">
          <div className="text-4xl mb-3 opacity-50">🕸️</div>
          <p className="text-sm text-slate-300">
            {language === "en" ? "No social connections yet." : "暂无交互节点记录。"}
          </p>
          <p className="text-xs text-slate-500 mt-2">
            {language === "en" ? "Claim or Sponsor bounties to build your network." : "参与悬赏即可自动建立社交网络！"}
          </p>
        </div>
      ) : (
        <div className="space-y-4 relative z-10">
          <div className="flex items-center gap-2 mb-3">
            <div className="h-1 flex-1 bg-gradient-to-r from-fuchsia-500/50 to-transparent rounded-full"></div>
            <div className="text-xs font-semibold text-fuchsia-300 uppercase tracking-widest px-2">
              {language === 'en' ? 'Active Connections' : '活跃节点'}
            </div>
            <div className="h-1 flex-1 bg-gradient-to-l from-pink-500/50 to-transparent rounded-full"></div>
          </div>
          <div className="grid gap-3">
            {connections.map((c: any) => {
              // Identify the "other" user in the connection
              const isUserA = c.account.userA.toBase58() === wallet.publicKey?.toBase58();
              const peerAddress = isUserA ? c.account.userB.toBase58() : c.account.userA.toBase58();
              const interactions = c.account.interactionCount;

              return (
                <div key={c.publicKey.toBase58()} className="flex items-center justify-between p-3 rounded-xl bg-slate-900/60 border border-slate-700/50 hover:border-fuchsia-500/30 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-slate-800 border border-slate-600 flex items-center justify-center text-xs font-mono text-slate-400">
                      {peerAddress.slice(0, 2)}
                    </div>
                    <div>
                      <div className="text-sm font-medium text-slate-200 font-mono">
                        {peerAddress.slice(0, 6)}...{peerAddress.slice(-4)}
                      </div>
                      <div className="text-xs text-slate-500">
                        {language === 'en' ? 'Connection' : '生态节点'}
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-col items-end">
                    <span className="text-xs font-bold text-fuchsia-400 bg-fuchsia-500/10 px-2 py-1 rounded border border-fuchsia-500/20">
                      {interactions.toString()} {language === 'en' ? 'actions' : '次互动'}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
