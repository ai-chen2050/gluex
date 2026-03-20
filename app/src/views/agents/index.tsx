import { BN } from '@coral-xyz/anchor';
import { PublicKey, SystemProgram, Transaction } from '@solana/web3.js';
import { FC, useCallback, useEffect, useState } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { useGlueXProgram } from '../../hooks/useGlueXProgram';
import useNotificationStore from '../../stores/useNotificationStore';
import { decodeFixedString, lamportsToSol, solToLamports, toUnixSeconds } from '../../utils/solana';
import { useLanguage } from '../../contexts/LanguageProvider';
import { useNetworkConfiguration } from '../../contexts/NetworkConfigurationProvider';
import { AgentProfileCard } from '../../components/AgentProfileCard';
import { SocialGraphCard } from '../../components/SocialGraphCard';

const statusColorMap: Record<string, string> = {
  pending: 'badge-info',
  proofSubmitted: 'badge-warning',
  approved: 'badge-success',
  rejected: 'badge-error',
  paid: 'badge-success',
};

const unixToLocale = (value: BN | number) => {
  const ts = BN.isBN(value) ? value.toNumber() : value;
  if (!ts) return '—';
  return new Date(ts * 1000).toLocaleString();
};

export const AgentsView: FC = () => {
  const wallet = useWallet();
  const program = useGlueXProgram();
  const { set: pushNotification } = useNotificationStore();
  const { language } = useLanguage();
  const { networkConfiguration } = useNetworkConfiguration();

  // Convert network name to solscan param
  const solscanParam = networkConfiguration === 'mainnet' ? '' : `?cluster=${networkConfiguration}`;

  const [description, setDescription] = useState('');
  const [requirements, setRequirements] = useState('');
  const [incentiveAmount, setIncentiveAmount] = useState(1);
  const [maxClaims, setMaxClaims] = useState(1);
  const localDatetimeNow = (() => {
    const d = new Date();
    d.setDate(d.getDate() + 7);
    const pad = (n: number) => n.toString().padStart(2, '0');
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(
      d.getHours()
    )}:${pad(d.getMinutes())}`;
  })();
  const [deadline, setDeadline] = useState(localDatetimeNow);

  const [loading, setLoading] = useState(false);
  const [bounties, setBounties] = useState<any[]>([]);
  const [executions, setExecutions] = useState<any[]>([]);
  const [focusedField, setFocusedField] = useState<string | null>(null);

  const notify = useCallback(
    (type: string, message: string, description?: string) => {
      pushNotification((state: any) => {
        state.notifications = [
          ...state.notifications,
          { type, message, description },
        ];
      });
    },
    [pushNotification],
  );

  const fetchBounties = useCallback(async () => {
    if (!program) return;
    try {
      const allBounties = await (program as any).account.openBounty.all();
      const allExecutions = await (program as any).account.bountyExecution.all();
      setBounties(allBounties);
      setExecutions(allExecutions);
    } catch (e) {
      console.error("Failed to fetch bounties", e);
    }
  }, [program]);

  useEffect(() => {
    fetchBounties();
  }, [fetchBounties]);

  const handlePublishBounty = async () => {
    if (!program || !wallet.publicKey) {
      notify('warning', language === 'en' ? 'Connect wallet first' : '请先连接钱包');
      return;
    }

    if (!description.trim()) {
      notify('warning', language === 'en' ? 'Description is required' : '任务描述不能为空');
      return;
    }

    setLoading(true);
    try {
      const bountyId = new BN(Math.floor(Date.now() / 1000));
      const [bountyPda] = PublicKey.findProgramAddressSync(
        [
          Buffer.from("open-bounty"),
          wallet.publicKey.toBuffer(),
          Buffer.from(bountyId.toArray("le", 8))
        ],
        program.programId
      );

      const lamports = solToLamports(incentiveAmount);
      const deadlineSecs = new BN(toUnixSeconds(deadline));

      const [feePoolPda] = PublicKey.findProgramAddressSync([Buffer.from('gluex-fee-pool')], program.programId);
      const feePoolAcct = await (program.provider as any).connection.getAccountInfo(feePoolPda);
      const accounts: any = {
        openBounty: bountyPda,
        issuer: wallet.publicKey,
        systemProgram: SystemProgram.programId,
      };
      accounts.feePool = feePoolAcct ? feePoolPda : null;

      await (program as any).methods
        .publishBounty(
          bountyId,
          description,
          requirements,
          new BN(lamports),
          deadlineSecs,
          maxClaims
        )
        .accounts(accounts)
        .rpc();

      notify('success', language === 'en' ? 'Bounty Published!' : '悬赏任务发布成功！');
      fetchBounties();
      setDescription('');
      setRequirements('');
    } catch (error) {
      console.error(error);
      notify('error', language === 'en' ? 'Failed to publish bounty' : '发布悬赏失败', (error as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const handleClaim = async (bountyPda: PublicKey) => {
    if (!wallet.publicKey || !program) return;
    try {
      const [bountyExecPda] = PublicKey.findProgramAddressSync(
        [Buffer.from("bounty-exec"), bountyPda.toBuffer(), wallet.publicKey.toBuffer()],
        program.programId
      );

      await (program as any).methods
        .claimBounty()
        .accounts({
          openBounty: bountyPda,
          bountyExecution: bountyExecPda,
          taker: wallet.publicKey,
          systemProgram: SystemProgram.programId,
        })
        .rpc();
        
      notify('success', language === 'en' ? 'Bounty Claimed!' : '成功认领任务！');
      fetchBounties();
    } catch (e) {
      console.error(e);
      notify('error', language === 'en' ? 'Failed to claim bounty' : '认领任务失败', (e as Error).message);
    }
  };

  const handleVerify = async (bountyPda: PublicKey, taker: PublicKey, isApproved: boolean) => {
    if (!wallet.publicKey || !program) return;
    try {
      const [bountyExecPda] = PublicKey.findProgramAddressSync(
        [Buffer.from("bounty-exec"), bountyPda.toBuffer(), taker.toBuffer()],
        program.programId
      );
      
      const [takerProfilePda] = PublicKey.findProgramAddressSync(
        [Buffer.from("agent-profile"), taker.toBuffer()],
        program.programId
      );
      
      const takerProfileAcct = await (program.provider as any).connection.getAccountInfo(takerProfilePda);
      
      let referrerProfilePda = null;
      if (takerProfileAcct) {
         const profileData = await (program as any).account.agentProfile.fetch(takerProfilePda);
         if (profileData.invitedBy.toBase58() !== PublicKey.default.toBase58()) {
            const [refPda] = PublicKey.findProgramAddressSync(
              [Buffer.from("agent-profile"), profileData.invitedBy.toBuffer()],
              program.programId
            );
            referrerProfilePda = refPda;
         }
      }

      const tx = new Transaction();

      tx.add(
        await (program as any).methods
          .verifyAndRewardBounty(isApproved)
          .accounts({
            openBounty: bountyPda,
            bountyExecution: bountyExecPda,
            issuer: wallet.publicKey,
            takerAccount: taker,
            takerProfile: takerProfileAcct ? takerProfilePda : null,
            referrerProfile: referrerProfilePda,
          })
          .instruction()
      );

      if (isApproved) {
        const [connectionPda] = PublicKey.findProgramAddressSync(
          [Buffer.from("social-conn"), wallet.publicKey.toBuffer(), taker.toBuffer()],
          program.programId
        );
        tx.add(
          await (program as any).methods
            .recordSocialInteraction()
            .accounts({
              connection: connectionPda,
              userA: wallet.publicKey,
              userB: taker,
              systemProgram: SystemProgram.programId,
            })
            .instruction()
        );
      }

      await (program.provider as any).sendAndConfirm(tx);

      notify('success', isApproved ? (language === 'en' ? 'Bounty rewarded!' : '悬赏奖金已发放！') : (language === 'en' ? 'Bounty rejected' : '已拒绝该交付'));
      fetchBounties();
    } catch (e) {
      console.error(e);
      notify('error', language === 'en' ? 'Failed to verify' : '审核失败', (e as Error).message);
    }
  };

  const renderBountyCard = (b: any) => {
    const isIssuer = b.account.issuer.toBase58() === wallet.publicKey?.toBase58();
    const isAvailable = b.account.currentClaims < b.account.maxClaims;
    
    return (
      <div key={b.publicKey.toBase58()} className="relative rounded-2xl border border-indigo-500/30 bg-gradient-to-b from-slate-900/80 to-slate-950/80 p-6 space-y-4 hover:border-indigo-400/60 shadow-[0_8px_30px_rgba(79,70,229,0.1)] hover:shadow-[0_15px_40px_rgba(136,58,255,0.2)] transition-all duration-300">
        <div className="absolute top-0 right-0 p-4 flex items-center gap-2">
            <a 
              href={`https://solscan.io/account/${b.publicKey.toBase58()}${solscanParam}`} 
              target="_blank" 
              rel="noreferrer noopener"
              className="text-slate-400 hover:text-indigo-400 transition-colors"
              title="View on Solscan"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" />
              </svg>
            </a>
            <div className={`badge ${isAvailable ? 'badge-success' : 'badge-warning'} animate-pulse`}>
              {isAvailable ? 'Available' : 'Full'}
            </div>
        </div>
        <div>
          <h3 className="text-xl font-bold text-white mb-1 pr-16">{typeof b.account.description === 'string' ? b.account.description : decodeFixedString(b.account.description)}</h3>
          <p className="text-sm text-slate-400 line-clamp-2">{(typeof b.account.taskRequirements === 'string' ? b.account.taskRequirements : decodeFixedString(b.account.taskRequirements)) || 'No specific requirements provided.'}</p>
        </div>
        
        <div className="grid grid-cols-2 gap-4 text-sm mt-4">
          <div className="bg-slate-950/50 rounded-lg p-3 border border-slate-800">
            <p className="text-slate-500 text-xs uppercase mb-1">Incentive</p>
            <p className="font-mono text-indigo-400 font-bold">{(b.account.incentiveAmount.toNumber() / 1e9).toFixed(2)} SOL</p>
          </div>
          <div className="bg-slate-950/50 rounded-lg p-3 border border-slate-800">
            <p className="text-slate-500 text-xs uppercase mb-1">Deadline</p>
            <p className="font-mono text-slate-300">{unixToLocale(b.account.deadline)}</p>
          </div>
          <div className="bg-slate-950/50 rounded-lg p-3 border border-slate-800">
            <p className="text-slate-500 text-xs uppercase mb-1">Claims</p>
            <p className="font-mono text-slate-300">{b.account.currentClaims} / {b.account.maxClaims}</p>
          </div>
          <div className="bg-slate-950/50 rounded-lg p-3 border border-slate-800">
            <p className="text-slate-500 text-xs uppercase mb-1">Issuer</p>
            <p className="font-mono text-slate-400 text-xs truncate" title={b.account.issuer.toBase58()}>
              {b.account.issuer.toBase58().substring(0, 8)}...
            </p>
          </div>
        </div>

        <div className="pt-4 space-y-3">
          {/* Taker View: Claim Button */}
          {!isIssuer && (
            <button
              onClick={() => handleClaim(b.publicKey)}
              disabled={!wallet.publicKey || !isAvailable}
              className="btn w-full bg-gradient-to-r from-indigo-600 to-fuchsia-600 border-none text-white hover:scale-[1.02] shadow-[0_0_15px_rgba(79,70,229,0.3)] hover:shadow-[0_0_25px_rgba(136,58,255,0.4)] disabled:opacity-50 disabled:hover:scale-100"
            >
              {!isAvailable ? 'No longer available' : (language === 'en' ? 'Claim Bounty' : '认领悬赏')}
            </button>
          )}

          {/* Issuer View: Review Claims */}
          {isIssuer && (
            <div className="border border-indigo-500/30 bg-slate-950/50 rounded-xl p-4">
              <h4 className="text-sm font-bold text-indigo-300 mb-2">
                {language === 'en' ? 'Manage Claims' : '管理认领者'}
              </h4>
              <div className="space-y-2">
                {executions.filter(e => e.account.bountyPda.toBase58() === b.publicKey.toBase58()).length === 0 ? (
                  <p className="text-xs text-slate-500">{language === 'en' ? 'No claims yet.' : '暂无人认领'}</p>
                ) : (
                  executions
                    .filter(e => e.account.bountyPda.toBase58() === b.publicKey.toBase58())
                    .map(exec => (
                      <div key={exec.publicKey.toBase58()} className="flex items-center justify-between text-xs bg-slate-900 rounded p-2 border border-slate-700">
                        <span className="font-mono text-slate-300 truncate w-1/3" title={exec.account.taker.toBase58()}>
                          {exec.account.taker.toBase58().slice(0, 6)}...
                        </span>
                        
                        {exec.account.isApproved ? (
                          <span className="text-emerald-400 font-bold px-2">Paid ✔</span>
                        ) : exec.account.isRejected ? (
                          <span className="text-rose-400 font-bold px-2">Rejected ✖</span>
                        ) : (
                          <div className="flex gap-2">
                            <button 
                              onClick={() => handleVerify(b.publicKey, exec.account.taker, true)} 
                              className="btn btn-xs outline-none bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500 hover:text-white border-emerald-500/50"
                            >
                              Approve
                            </button>
                            <button 
                              onClick={() => handleVerify(b.publicKey, exec.account.taker, false)}
                              className="btn btn-xs outline-none bg-rose-500/20 text-rose-400 hover:bg-rose-500 hover:text-white border-rose-500/50"
                            >
                              Reject
                            </button>
                          </div>
                        )}
                      </div>
                    ))
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="mx-auto max-w-6xl px-3 sm:px-4 py-8 sm:py-12 space-y-12">
      <section className="text-center space-y-4">
        <h1 className="text-4xl md:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-fuchsia-400 to-pink-400">
          Agent Guild & Bounties
        </h1>
        <p className="text-slate-400 max-w-2xl mx-auto text-lg">
          {language === 'en' 
            ? 'Broadcast open missions to the agent network. Anyone can claim, complete, and build their Web3 reputation.'
            : '向全网智能体广播开放悬赏任务。任何人都可以认领、完成任务并积累链上声誉。'}
        </p>
      </section>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Left Column */}
        <div className="lg:col-span-1 space-y-6 self-start sticky top-24">
          {/* Publish Form */}
          <div className="relative rounded-3xl border border-indigo-500/30 bg-gradient-to-b from-slate-900/90 to-slate-950/80 p-6 md:p-8 space-y-6 shadow-[0_15px_50px_rgba(79,70,229,0.15)] overflow-hidden group">
            {/* Background Glow */}
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-indigo-500 to-transparent opacity-50"></div>
            <div className="absolute -top-10 -left-10 w-40 h-40 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none group-hover:bg-indigo-500/20 transition-all duration-700"></div>

            <div className="flex items-center gap-3 mb-6 relative z-10">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500/20 to-blue-500/20 flex items-center justify-center text-indigo-400 border border-indigo-500/30">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v6m3-3H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h2 className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-indigo-300 to-blue-300">
                {language === 'en' ? 'Sponsor a Mission' : '发布悬赏'}
              </h2>
            </div>
            
            <div className="space-y-4 relative z-10">
            <label className="form-control group">
              <span className="label-text text-sm mb-1 text-slate-300">
                {language === 'en' ? 'Mission Title / Description' : '任务简述'}
              </span>
              <input
                type="text"
                placeholder={language === 'en' ? 'e.g. Translate Whitepaper to Spanish' : '例如：开发一个前端监控面板'}
                className="input input-bordered w-full bg-slate-950/50 focus:border-indigo-500"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </label>

            <label className="form-control">
              <span className="label-text flex flex-col items-start gap-1 mb-2">
                <span className="text-sm text-slate-300">{language === 'en' ? 'Detailed Requirements' : '具体要求'}</span>
                <span className="text-indigo-400 text-xs">{language === 'en' ? '* Include contact info for delivery' : '* 建议附带联系方式以便交付'}</span>
              </span>
              <textarea
                className="textarea textarea-bordered w-full bg-slate-950/50 focus:border-indigo-500 h-24"
                placeholder={language === 'en' ? 'Format, acceptance criteria, and your contact info (Twitter/Email/Telegram)...' : '任务要求、验收标准，以及用于接收交付的联系方式（如Twitter/邮箱）...'}
                value={requirements}
                onChange={(e) => setRequirements(e.target.value)}
              />
            </label>

            <div className="grid grid-cols-2 gap-4">
              <label className="form-control">
                <span className="label-text text-sm mb-1 text-slate-300">
                  {language === 'en' ? 'Reward (SOL)' : '赏金 (SOL)'}
                </span>
                <input
                  type="number"
                  step="0.01"
                  min="0.01"
                  className="input input-bordered w-full bg-slate-950/50"
                  value={incentiveAmount}
                  onChange={(e) => setIncentiveAmount(Number(e.target.value))}
                />
              </label>

              <label className="form-control">
                <span className="label-text text-sm mb-1 text-slate-300">
                  {language === 'en' ? 'Max Claims' : '认领名额'}
                </span>
                <input
                  type="number"
                  min="1"
                  className="input input-bordered w-full bg-slate-950/50"
                  value={maxClaims}
                  onChange={(e) => setMaxClaims(Number(e.target.value))}
                />
              </label>
            </div>

            <label className="form-control">
              <span className="label-text text-sm mb-1 text-slate-300">
                {language === 'en' ? 'Deadline' : '截止时间'}
              </span>
              <input
                type="datetime-local"
                className="input input-bordered w-full bg-slate-950/50"
                value={deadline}
                onChange={(e) => setDeadline(e.target.value)}
              />
            </label>

            <div className="pt-4">
              <button
                onClick={handlePublishBounty}
                disabled={loading}
                className="btn w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white border-0 hover:scale-[1.02] shadow-[0_5px_20px_rgba(79,70,229,0.3)]"
              >
                {loading ? <span className="loading loading-spinner"></span> : (language === 'en' ? 'Publish Mission' : '发布悬赏')}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Right Column - Profile, Social Graph & Bounty List */}
      <div className="lg:col-span-2 space-y-6">
        {/* Top Indicators Overlay */}
        <div className="grid md:grid-cols-2 gap-6">
          <AgentProfileCard />
          <SocialGraphCard />
        </div>

        <div className="flex items-center justify-between mt-10 mb-4 bg-slate-900/40 p-4 rounded-2xl border border-slate-700/50 backdrop-blur-sm shadow-inner">
          <div className="flex items-center gap-3">
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
            </span>
            <h2 className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-emerald-300 to-teal-200 uppercase tracking-wide">
              {language === 'en' ? 'Active Guild Missions' : '活跃悬赏大厅'}
            </h2>
          </div>
          <div className="badge badge-emerald bg-emerald-500/10 text-emerald-400 border-emerald-500/30 p-4 font-mono font-bold shadow-[0_0_10px_rgba(52,211,153,0.2)]">
            {bounties.length} ACTIVE
          </div>
        </div>

          {bounties.length === 0 ? (
            <div className="border border-dashed border-slate-700 rounded-3xl p-12 text-center">
              <div className="text-6xl mb-4 opacity-50">🧭</div>
              <h3 className="text-xl font-medium text-slate-300 mb-2">
                {language === 'en' ? 'No active bounties' : '暂无悬赏任务'}
              </h3>
              <p className="text-slate-500">
                {language === 'en' ? 'Be the first to sponsor a mission and attract top agents.' : '抢先发布一个悬赏，吸引顶级智能体完成！'}
              </p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 gap-6">
              {bounties.map(renderBountyCard)}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
