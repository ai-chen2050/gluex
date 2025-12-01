import { BN } from '@coral-xyz/anchor';
import { FC, useCallback, useEffect, useMemo, useState } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import useNotificationStore from '../../stores/useNotificationStore';
import { useGlueXProgram } from '../../hooks/useGlueXProgram';
import { decodeFixedString, lamportsToSol } from '../../utils/solana';
import { useLanguage } from '../../contexts/LanguageProvider';
import { useNetworkConfiguration } from '../../contexts/NetworkConfigurationProvider';

const copy = {
  en: {
    title: 'Leaders',
    subtitle: 'Real-time leaderboard and analytics',
    totalGoals: 'Total Goals',
    uniqueUsers: 'Unique Users',
    totalIncentive: 'Total Incentive',
    topGoals: 'Top Goals by Incentive',
    topUsers: 'Top Users by Issued Incentives',
    refresh: 'Refresh',
    loading: 'Loading...',
    description: 'Description',
    amount: 'Amount (SOL)',
    issuer: 'Issuer',
    taker: 'Taker',
  },
  zh: {
    title: '排行榜',
    subtitle: '实时排行榜与数据分析',
    totalGoals: '任务总数',
    uniqueUsers: '用户数',
    totalIncentive: '总激励',
    topGoals: '按激励金额排行',
    topUsers: '按发起激励排行',
    refresh: '刷新',
    loading: '加载中...',
    description: '描述',
    amount: '金额（SOL）',
    issuer: '发起人',
    taker: '执行者',
  },
} as const;

const formatPubkeyShort = (pk: any) => (pk ? String(pk).slice(0, 8) + '…' : '—');

export const LeadersView: FC = () => {
  const program = useGlueXProgram();
  const wallet = useWallet();
  const { set: pushNotification } = useNotificationStore();
  const { language } = useLanguage();
  const { networkConfiguration } = useNetworkConfiguration();
  const t = copy[language];

  // Convert network name to solscan param
  const solscanParam = networkConfiguration === 'mainnet' ? '' : `?cluster=${networkConfiguration}`;

  const [loading, setLoading] = useState(false);
  const [items, setItems] = useState<any[]>([]);
  const [eventFilter, setEventFilter] = useState<'all' | 'habit' | 'target' | 'surprise'>('all');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const notify = useCallback((type: string, message: string, description?: string) => {
    pushNotification((state: any) => {
      state.notifications = [...state.notifications, { type, message, description }];
    });
  }, [pushNotification]);

  const refresh = useCallback(async () => {
    if (!program) return;
    setLoading(true);
    try {
      const list = await program.account['totalGoal'].all();
      setItems(list);
    } catch (err) {
      console.error(err);
      notify('error', t.loading, (err as Error).message);
    } finally {
      setLoading(false);
    }
  }, [program, notify, t.loading]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const stats = useMemo(() => {
    // apply filters
    const filtered = items.filter((it) => {
      const acc = it.account as any;
      // event type filter
      const eventKey = (() => {
        const k = Object.keys(acc.eventype ?? {})[0] ?? '';
        if (k === 'habitTraning') return 'habit';
        if (k === 'targetAchieve') return 'target';
        if (k === 'surpriseTime') return 'surprise';
        return '';
      })();
      if (eventFilter !== 'all' && eventFilter !== eventKey) return false;

      // completion time filter (if present)
      if (startDate || endDate) {
        const ts = BN.isBN(acc.completionTime) ? acc.completionTime.toNumber() : Number(acc.completionTime || 0);
        const startTs = startDate ? Math.floor(Date.parse(startDate) / 1000) : -Infinity;
        const endTs = endDate ? Math.floor(Date.parse(endDate) / 1000) : Infinity;
        if (ts < startTs || ts > endTs) return false;
      }
      return true;
    });

    const totalGoals = filtered.length;
    const users = new Set<string>();
    let totalIncentiveLamports = BigInt(0);

    filtered.forEach((it) => {
      const acc = it.account as any;
      const issuer = acc.issuer?.toBase58 ? acc.issuer.toBase58() : String(acc.issuer);
      const taker = acc.taker?.toBase58 ? acc.taker.toBase58() : String(acc.taker);
      users.add(issuer);
      users.add(taker);

      const v = acc.totalIncentiveAmount;
      let n = BigInt(0);
      if (BN.isBN(v)) n = BigInt(v.toNumber());
      else n = BigInt(typeof v === 'number' ? v : Number(v || 0));
      totalIncentiveLamports += n;
    });

    // limit to top N for display and charts
    const limited = filtered.slice(0, 100);

    return {
      totalGoals,
      uniqueUsers: users.size,
      totalIncentiveLamports,
      filtered,
      limited,
    };
  }, [items, eventFilter, startDate, endDate]);

  const topGoals = useMemo(() => {
    const source = stats.limited ?? items.slice(0, 100);
    return [...source]
      .sort((a, b) => {
        const av = BN.isBN(a.account.totalIncentiveAmount) ? a.account.totalIncentiveAmount.toNumber() : Number(a.account.totalIncentiveAmount || 0);
        const bv = BN.isBN(b.account.totalIncentiveAmount) ? b.account.totalIncentiveAmount.toNumber() : Number(b.account.totalIncentiveAmount || 0);
        return bv - av;
      })
      .slice(0, 10);
  }, [items, stats]);

  const topUsers = useMemo(() => {
    const map = new Map<string, bigint>();
    const source = stats.limited ?? items.slice(0, 100);
    source.forEach((it) => {
      const acc = it.account as any;
      const issuer = acc.issuer?.toBase58 ? acc.issuer.toBase58() : String(acc.issuer);
      const v = acc.totalIncentiveAmount;
      let n = BigInt(0);
      if (BN.isBN(v)) n = BigInt(v.toNumber());
      else n = BigInt(typeof v === 'number' ? v : Number(v || 0));
      map.set(issuer, (map.get(issuer) || BigInt(0)) + n);
    });
    const arr = Array.from(map.entries()).sort((a, b) => Number(b[1] - a[1]));
    return arr.slice(0, 10);
  }, [items, stats]);

  // Pie chart data by event type
  const pieData = useMemo(() => {
    const counts: Record<string, number> = { habit: 0, target: 0, surprise: 0, unknown: 0 };
    const source = stats.limited ?? items.slice(0, 100);
    source.forEach((it) => {
      const acc = it.account as any;
      const k = Object.keys(acc.eventype ?? {})[0] ?? '';
      if (k === 'habitTraning') counts.habit += 1;
      else if (k === 'targetAchieve') counts.target += 1;
      else if (k === 'surpriseTime') counts.surprise += 1;
      else counts.unknown += 1;
    });
    return counts;
  }, [items, stats]);

  // Time series: daily counts over last 30 days by completionTime
  const timeSeries = useMemo(() => {
    const DAYS = 30;
    const now = Math.floor(Date.now() / 1000);
    const daySec = 24 * 3600;
    const buckets: number[] = Array.from({ length: DAYS }, () => 0);
    const source = stats.limited ?? items.slice(0, 100);
    source.forEach((it) => {
      const acc = it.account as any;
      const ts = BN.isBN(acc.completionTime) ? acc.completionTime.toNumber() : Number(acc.completionTime || 0);
      if (!ts) return;
      const diff = now - ts;
      const idx = Math.floor(diff / daySec);
      if (idx >= 0 && idx < DAYS) {
        buckets[DAYS - 1 - idx] += 1;
      }
    });
    return buckets;
  }, [items, stats]);

  const PieChart: FC<{ data: Record<string, number>; size?: number }> = ({ data, size = 140 }) => {
    const total = Object.values(data).reduce((s, v) => s + v, 0);
    const colors = { habit: '#7c3aed', target: '#06b6d4', surprise: '#f97316', unknown: '#64748b' } as Record<string, string>;
    const r = size / 2;

    // only keep entries with positive values (skip zeros)
    const entries = Object.entries(data).filter(([, v]) => v > 0);

    // If nothing, render an empty subtle circle
    if (entries.length === 0) {
      return (
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ filter: 'drop-shadow(0 4px 12px rgba(0,0,0,0.6))' }} preserveAspectRatio="xMidYMid meet">
          <circle cx={r} cy={r} r={r * 0.9} fill="#0f172a" stroke="rgba(255,255,255,0.03)" strokeWidth={1} />
        </svg>
      );
    }

    // If single non-zero entry (100%), draw a full circle (arc with identical start/end won't render reliably)
    if (entries.length === 1) {
      const [k] = entries[0];
      const color = colors[k] ?? '#999';
      return (
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ filter: 'drop-shadow(0 4px 12px rgba(0,0,0,0.6))' }} preserveAspectRatio="xMidYMid meet">
          <circle cx={r} cy={r} r={r} fill={color} stroke="rgba(0,0,0,0.18)" strokeWidth={1} />
        </svg>
      );
    }

    // multiple slices: build arc paths skipping zeros
    let angle = 0;
    const slices = entries.map(([k, v]) => {
      const portion = (v / (total || 1));
      const start = angle;
      const end = angle + portion * 360;
      angle = end;
      const large = end - start > 180 ? 1 : 0;
      const a = (deg: number) => {
        const rad = (deg - 90) * (Math.PI / 180);
        return [r + r * Math.cos(rad), r + r * Math.sin(rad)];
      };
      const [sx, sy] = a(start);
      const [ex, ey] = a(end);
      const path = `M ${r} ${r} L ${sx} ${sy} A ${r} ${r} 0 ${large} 1 ${ex} ${ey} Z`;
      return { key: k, path, color: colors[k] ?? '#999', value: v };
    });

    return (
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ filter: 'drop-shadow(0 4px 12px rgba(0,0,0,0.6))' }} preserveAspectRatio="xMidYMid meet">
        {slices.map((s) => (
          <path key={s.key} d={s.path} fill={s.color} stroke="rgba(15,23,42,0.7)" strokeWidth={0.8} />
        ))}
      </svg>
    );
  };

  const LineChart: FC<{ data: number[]; width?: number; height?: number }> = ({ data, width = 400, height = 100 }) => {
    const max = Math.max(...data, 1);
    const step = width / (data.length - 1 || 1);
    const points = data.map((v, i) => `${i * step},${height - (v / max) * height}`).join(' ');
    return (
      <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} className="rounded drop-shadow-[0_4px_8px_rgba(0,0,0,0.3)]">
        <polyline fill="none" stroke="#7c3aed" strokeWidth={2} points={points} strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    );
  };

  return (
    <div className="mx-auto max-w-6xl px-3 sm:px-4 py-8 sm:py-12 space-y-8 sm:space-y-12">
      
      {/* Hero & Filters Section */}
      <section className="rounded-xl sm:rounded-2xl border border-indigo-500/20 bg-gradient-to-br from-slate-950/60 to-slate-900/60 backdrop-blur-md p-4 sm:p-6 space-y-4 shadow-[0_10px_40px_rgba(79,70,229,0.15)]">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-fuchsia-400 animate-pulse" />
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-indigo-300 to-fuchsia-300">
              {t.title}
            </h1>
          </div>
          <button 
            onClick={refresh}
            className="btn btn-sm sm:btn-md px-4 sm:px-6 py-2 sm:py-2 font-bold bg-gradient-to-r from-indigo-500 to-fuchsia-500 text-white border-0 shadow-[0_4px_12px_rgba(136,58,255,0.2)] hover:shadow-[0_6px_16px_rgba(136,58,255,0.3)] hover:from-indigo-400 hover:to-fuchsia-400 transition-all duration-200 transform hover:scale-105 active:scale-95 whitespace-nowrap flex-shrink-0"
          >
            {t.refresh}
          </button>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 items-center flex-wrap">
          <label className="text-xs sm:text-sm text-slate-300 font-semibold uppercase tracking-wider">Event:</label>
          <select className="select select-sm bg-slate-800/50 border-indigo-500/30 text-slate-100" value={eventFilter} onChange={(e) => setEventFilter(e.target.value as any)}>
            <option value="all">All</option>
            <option value="habit">HabitTraning</option>
            <option value="target">TargetAchieve</option>
            <option value="surprise">SurpriseTime</option>
          </select>
          <label className="text-xs sm:text-sm text-slate-300 font-semibold uppercase tracking-wider">From:</label>
          <input type="date" className="input input-sm bg-slate-800/50 border-indigo-500/30 text-slate-100" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
          <label className="text-xs sm:text-sm text-slate-300 font-semibold uppercase tracking-wider">To:</label>
          <input type="date" className="input input-sm bg-slate-800/50 border-indigo-500/30 text-slate-100" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
        </div>
      </section>

      {/* Stats Cards - Grid with Animation */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
        {[
          { label: t.totalGoals, value: stats.totalGoals, icon: '📊', color: 'from-emerald-500 to-green-500' },
          { label: t.uniqueUsers, value: stats.uniqueUsers, icon: '👥', color: 'from-blue-500 to-cyan-500' },
          { label: t.totalIncentive, value: `${lamportsToSol(Number(stats.totalIncentiveLamports))} SOL`, icon: '💰', color: 'from-orange-500 to-red-500' },
        ].map((stat, idx) => (
          <div
            key={stat.label}
            className="group relative rounded-xl sm:rounded-2xl border border-indigo-500/20 bg-gradient-to-br from-slate-950/60 to-slate-900/40 backdrop-blur-md p-6 sm:p-8 space-y-3 sm:space-y-4 shadow-[0_10px_40px_rgba(79,70,229,0.1)] hover:shadow-[0_20px_60px_rgba(136,58,255,0.2)] transition-all duration-300 hover:border-indigo-500/40 hover:from-slate-950/80 hover:to-slate-900/60 overflow-hidden"
            style={{ animation: `fadeInUp 0.5s ease-out ${idx * 0.1}s both` }}
          >
            <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500/10 to-fuchsia-500/10 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 -z-10"></div>
            <div className="flex items-center justify-between">
              <div>
                <div className="text-xs sm:text-sm uppercase tracking-wider text-slate-400 group-hover:text-slate-300 transition-colors font-semibold">
                  {stat.label}
                </div>
                <div className={`text-3xl sm:text-4xl md:text-5xl font-black mt-2 text-transparent bg-clip-text bg-gradient-to-r ${stat.color} group-hover:scale-105 transition-transform duration-300`}>
                  {stat.value}
                </div>
              </div>
              <div className="text-4xl sm:text-5xl opacity-20 group-hover:opacity-40 group-hover:scale-125 transition-all duration-300">
                {stat.icon}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Charts Section */}
      <div className="grid md:grid-cols-3 gap-4 sm:gap-6">
        <div className="group rounded-xl sm:rounded-2xl p-4 sm:p-6 bg-gradient-to-br from-slate-900/40 to-slate-800/10 border border-indigo-500/20 flex flex-col items-center justify-center shadow-[0_10px_40px_rgba(79,70,229,0.1)] hover:shadow-[0_20px_60px_rgba(136,58,255,0.2)] transition-all duration-300 hover:border-indigo-500/40 overflow-hidden">
          <h4 className="text-xs sm:text-sm text-slate-300 mb-4 font-semibold uppercase tracking-wider">By Event Type</h4>
          <div className="group-hover:scale-110 transition-transform duration-300">
            <PieChart data={pieData} size={160} />
          </div>
          <div className="mt-4 text-xs text-slate-400 space-y-2">
            <div><span className="inline-block w-2 h-2 sm:w-3 sm:h-3 bg-[#7c3aed] mr-2 align-middle rounded-full" /> Habit: {pieData.habit}</div>
            <div><span className="inline-block w-2 h-2 sm:w-3 sm:h-3 bg-[#06b6d4] mr-2 align-middle rounded-full" /> Target: {pieData.target}</div>
            <div><span className="inline-block w-2 h-2 sm:w-3 sm:h-3 bg-[#f97316] mr-2 align-middle rounded-full" /> Surprise: {pieData.surprise}</div>
          </div>
        </div>

        <div className="rounded-xl sm:rounded-2xl p-4 sm:p-6 bg-gradient-to-br from-slate-900/40 to-slate-800/10 border border-indigo-500/20 col-span-1 md:col-span-2 shadow-[0_10px_40px_rgba(79,70,229,0.1)] hover:shadow-[0_20px_60px_rgba(136,58,255,0.2)] transition-all duration-300 hover:border-indigo-500/40">
          <h4 className="text-xs sm:text-sm text-slate-300 mb-4 font-semibold uppercase tracking-wider">Trends (last 30 days)</h4>
          <div className="overflow-x-auto hover:scale-105 transition-transform duration-300 origin-left">
            <LineChart data={timeSeries} width={600} height={120} />
          </div>
        </div>
      </div>

      {/* Top Goals and Top Users */}
      <div className="grid md:grid-cols-2 gap-6">
        <div className="rounded-xl sm:rounded-2xl p-4 sm:p-6 bg-gradient-to-br from-slate-900/60 to-slate-800/30 border border-indigo-500/20 shadow-[0_10px_40px_rgba(79,70,229,0.1)] hover:shadow-[0_20px_60px_rgba(136,58,255,0.2)] transition-all duration-300 hover:border-indigo-500/40">
          <h3 className="font-semibold text-base sm:text-lg mb-4 text-transparent bg-clip-text bg-gradient-to-r from-indigo-300 to-fuchsia-300">{t.topGoals}</h3>
          {loading ? (
            <div className="text-slate-400 text-center py-8">{t.loading}</div>
          ) : (
            <div className="space-y-3">
              {topGoals.map((g: any, idx: number) => {
                const pk = g.publicKey.toBase58();
                const issuerPk = g.account.issuer?.toBase58 ? g.account.issuer.toBase58() : String(g.account.issuer);
                const takerPk = g.account.taker?.toBase58 ? g.account.taker.toBase58() : String(g.account.taker);
                const incentive = BN.isBN(g.account.totalIncentiveAmount) ? g.account.totalIncentiveAmount.toNumber() : Number(g.account.totalIncentiveAmount || 0);
                return (
                <div key={pk} className="group relative p-4 bg-slate-800/40 rounded-lg border border-indigo-500/10 hover:border-indigo-500/40 transition-all duration-300 hover:shadow-[0_8px_24px_rgba(136,58,255,0.15)] hover:bg-slate-800/60 transform hover:-translate-y-1">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 text-xs sm:text-sm text-slate-400 mb-2">
                        <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-gradient-to-r from-indigo-500 to-fuchsia-500 text-white text-xs font-bold flex-shrink-0">
                          #{idx + 1}
                        </span>
                        <span className="text-slate-500">•</span>
                        <span className="truncate">{decodeFixedString(g.account.subGoals?.[0]?.title ?? []) || g.account.description}</span>
                        <a className="ml-auto text-xs text-indigo-400 hover:text-indigo-300 transition-colors flex-shrink-0" href={`https://solscan.io/account/${pk}${solscanParam}`} target="_blank" rel="noreferrer">View →</a>
                      </div>
                      <div className="font-semibold text-sm sm:text-base text-white mb-2 truncate">{g.account.description}</div>
                      <div className="text-xs text-slate-500 space-y-1">
                        <div><span className="text-slate-400">{t.issuer}:</span> <a className="text-indigo-400 hover:text-indigo-300 transition-colors" href={`https://solscan.io/account/${issuerPk}${solscanParam}`} target="_blank" rel="noreferrer">{formatPubkeyShort(issuerPk)}</a></div>
                        <div><span className="text-slate-400">{t.taker}:</span> <a className="text-indigo-400 hover:text-indigo-300 transition-colors" href={`https://solscan.io/account/${takerPk}${solscanParam}`} target="_blank" rel="noreferrer">{formatPubkeyShort(takerPk)}</a></div>
                      </div>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <div className="text-lg sm:text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-green-500">
                        {lamportsToSol(incentive)}
                      </div>
                      <div className="text-xs text-slate-500">SOL</div>
                    </div>
                  </div>
                </div>
              )})}
              {topGoals.length === 0 && <div className="text-slate-400 text-center py-8">—</div>}
            </div>
          )}
        </div>

        <div className="rounded-xl sm:rounded-2xl p-4 sm:p-6 bg-gradient-to-br from-slate-900/60 to-slate-800/30 border border-indigo-500/20 shadow-[0_10px_40px_rgba(79,70,229,0.1)] hover:shadow-[0_20px_60px_rgba(136,58,255,0.2)] transition-all duration-300 hover:border-indigo-500/40">
          <h3 className="font-semibold text-base sm:text-lg mb-4 text-transparent bg-clip-text bg-gradient-to-r from-indigo-300 to-fuchsia-300">{t.topUsers}</h3>
          {loading ? (
            <div className="text-slate-400 text-center py-8">{t.loading}</div>
          ) : (
            <div className="space-y-3">
              {(() => {
                const max = topUsers.length ? Number(topUsers[0][1]) : 1;
                return topUsers.map(([pk, lamports], idx) => {
                  const value = Number(lamports);
                  const pct = Math.round((value / Math.max(max, 1)) * 100);
                  return (
                  <div key={pk} className="group p-3 bg-slate-800/40 rounded-lg border border-indigo-500/10 hover:border-indigo-500/40 transition-all duration-300 hover:shadow-[0_8px_24px_rgba(136,58,255,0.15)] hover:bg-slate-800/60">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-gradient-to-r from-indigo-500 to-fuchsia-500 rounded-full flex items-center justify-center text-xs font-bold text-white flex-shrink-0">{idx + 1}</div>
                        <div className="font-mono text-xs sm:text-sm text-slate-300"><a className="text-indigo-400 hover:text-indigo-300 transition-colors" href={`https://solscan.io/account/${pk}${solscanParam}`} target="_blank" rel="noreferrer">{pk.slice(0, 12)}…</a></div>
                      </div>
                      <div className="font-semibold text-sm text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-green-500">{lamportsToSol(Number(lamports))} SOL</div>
                    </div>
                    <div className="w-full bg-slate-700/50 h-2 rounded-full overflow-hidden">
                      <div 
                        className="h-2 bg-gradient-to-r from-indigo-500 to-fuchsia-500 rounded-full transition-all duration-500 group-hover:shadow-[0_0_12px_rgba(136,58,255,0.6)]" 
                        style={{ width: `${pct}%` }} 
                      />
                    </div>
                  </div>
                )});
              })()}
              {topUsers.length === 0 && <div className="text-slate-400 text-center py-8">—</div>}
            </div>
          )}
        </div>
      </div>

      <style jsx>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
};
