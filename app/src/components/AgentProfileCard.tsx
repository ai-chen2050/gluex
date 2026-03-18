import { FC, useEffect, useState } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import * as web3 from '@solana/web3.js';
import { useGlueXProgram } from '../hooks/useGlueXProgram';
import { useLanguage } from '../contexts/LanguageProvider';

export const AgentProfileCard: FC = () => {
  const wallet = useWallet();
  const program = useGlueXProgram();
  const { language } = useLanguage();
  
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [referrer, setReferrer] = useState("");

  const fetchProfile = async () => {
    if (!wallet.publicKey || !program) return;
    try {
      const [pda] = web3.PublicKey.findProgramAddressSync(
        [Buffer.from("agent-profile"), wallet.publicKey.toBuffer()],
        program.programId
      );
      const data = await (program as any).account.agentProfile.fetch(pda);
      setProfile(data);
    } catch (e) {
      setProfile(null);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, [wallet.publicKey, program]);

  const handleRegister = async () => {
    if (!wallet.publicKey || !program) return;
    setLoading(true);
    try {
      const [pda] = web3.PublicKey.findProgramAddressSync(
        [Buffer.from("agent-profile"), wallet.publicKey.toBuffer()],
        program.programId
      );
      let refKey: web3.PublicKey | null = null;
      try {
        if (referrer) refKey = new web3.PublicKey(referrer);
      } catch (e) {}

      const tx = await (program as any).methods
        .registerProfile(refKey)
        .accounts({
          profile: pda,
          payer: wallet.publicKey,
          systemProgram: web3.SystemProgram.programId,
        })
        .rpc();
        
      console.log("Registered Profile:", tx);
      await fetchProfile();
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (!wallet.publicKey) return null;

  return (
    <div className="w-full h-full relative group rounded-3xl border border-indigo-500/30 bg-gradient-to-b from-slate-900/90 to-slate-950/90 backdrop-blur-xl p-6 md:p-8 shadow-[0_10px_40px_rgba(79,70,229,0.15)] hover:shadow-[0_20px_60px_rgba(79,70,229,0.3)] transition-all duration-500 overflow-hidden">
      {/* Decorative background Elements */}
      <div className="absolute top-0 right-0 -mt-10 -mr-10 w-40 h-40 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none group-hover:bg-indigo-500/20 transition-all duration-700"></div>
      <div className="absolute bottom-0 left-0 -mb-10 -ml-10 w-40 h-40 bg-fuchsia-500/10 rounded-full blur-3xl pointer-events-none group-hover:bg-fuchsia-500/20 transition-all duration-700"></div>

      <div className="flex items-center gap-3 mb-6 relative z-10">
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-500/20 to-fuchsia-500/20 flex items-center justify-center text-indigo-400 border border-indigo-500/30 shadow-inner">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-7 h-7">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
          </svg>
        </div>
        <div>
          <h3 className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-indigo-300 via-fuchsia-300 to-pink-300">
            {language === "en" ? "Agent Profile" : "智能体档案"}
          </h3>
          <p className="text-xs text-indigo-400/80 font-mono tracking-widest uppercase mt-0.5">Verified Identity</p>
        </div>
      </div>
      
      {profile ? (
        <div className="space-y-5 relative z-10">
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-slate-950/50 rounded-2xl p-4 border border-indigo-500/20 group-hover:border-indigo-500/40 transition-colors">
              <span className="text-slate-500 text-xs uppercase tracking-wider block mb-1">Reputation</span>
              <div className="flex items-end gap-2">
                <span className="font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-200 to-yellow-500 text-3xl leading-none">
                  {profile.reputationScore.toString()}
                </span>
                <span className="text-yellow-500/50 pb-1 text-sm">pts</span>
              </div>
            </div>
            
            <div className="bg-slate-950/50 rounded-2xl p-4 border border-fuchsia-500/20 group-hover:border-fuchsia-500/40 transition-colors">
              <span className="text-slate-500 text-xs uppercase tracking-wider block mb-1">Missions</span>
              <div className="flex items-end gap-2">
                <span className="font-black text-transparent bg-clip-text bg-gradient-to-r from-fuchsia-200 to-pink-500 text-3xl leading-none">
                  {profile.tasksCompleted}
                </span>
                <span className="text-pink-500/50 pb-1 text-sm">done</span>
              </div>
            </div>
          </div>

          <div className="bg-slate-900/80 rounded-xl p-3 border border-slate-700/50 flex flex-col gap-2">
            <div className="flex justify-between items-center text-xs">
              <span className="text-slate-500 uppercase tracking-wider">Joined</span>
              <span className="text-slate-300 font-mono">{new Date(profile.joinedAt.toNumber() * 1000).toLocaleDateString()}</span>
            </div>
            
            {profile.invitedBy.toBase58() !== web3.PublicKey.default.toBase58() && (
              <div className="flex justify-between items-center text-xs border-t border-slate-800 pt-2">
                <span className="text-slate-500 uppercase tracking-wider">Inviter</span>
                <span className="text-indigo-400 font-mono truncate max-w-[120px]" title={profile.invitedBy.toBase58()}>
                  {profile.invitedBy.toBase58()}
                </span>
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          <p className="text-sm text-slate-400">
            {language === "en" ? "Create an on-chain identity to start earning reputation." : "创建链上身份以积累声誉和奖励。"}
          </p>
          <input
            type="text"
            placeholder={language === "en" ? "Referral Code (Solana Address)" : "邀请码 (Solana 地址)"}
            className="input input-bordered w-full bg-slate-900/50 border-indigo-500/30 text-sm"
            value={referrer}
            onChange={(e) => setReferrer(e.target.value)}
          />
          <button
            onClick={handleRegister}
            disabled={loading}
            className="btn w-full bg-gradient-to-r from-indigo-500 to-fuchsia-500 border-none text-white shadow-[0_4px_12px_rgba(136,58,255,0.3)] hover:scale-[1.02] transition-all"
          >
            {loading ? <span className="loading loading-spinner"></span> : (language === "en" ? "Register Profile" : "注册档案")}
          </button>
        </div>
      )}
    </div>
  );
};
