import { BN } from '@coral-xyz/anchor';
import { PublicKey, SystemProgram } from '@solana/web3.js';
import { FC, useCallback, useEffect, useMemo, useState } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { useGlueXProgram } from '../../hooks/useGlueXProgram';
import useNotificationStore from '../../stores/useNotificationStore';
import { decodeFixedString, lamportsToSol, solToLamports, toUnixSeconds } from '../../utils/solana';
import { useLanguage } from '../../contexts/LanguageProvider';

type StageInput = { title: string; deadline: string; amount: number };

const ROOM_DEFS = [
  { key: 'loveGame', value: { loveGame: {} }, labels: { en: 'Love game', zh: '恋爱空间' } },
  { key: 'groupGame', value: { groupGame: {} }, labels: { en: 'Group game', zh: '团队空间' } },
];

const RELATION_DEFS = [
  { key: 'parents', value: { parents: {} }, labels: { en: 'Parents', zh: '亲子' } },
  { key: 'lover', value: { lover: {} }, labels: { en: 'Lover', zh: '恋人' } },
  { key: 'bosstaff', value: { bosstaff: {} }, labels: { en: 'Boss & Staff', zh: '上下级' } },
  { key: 'partner', value: { partner: {} }, labels: { en: 'Partner / Friends', zh: '伙伴 / 朋友' } },
  { key: 'dao', value: { dao: {} }, labels: { en: 'DAO / Public', zh: 'DAO / 公域' } },
];

const EVENT_DEFS = [
  { key: 'habitTraning', value: { habitTraning: {} }, labels: { en: '21-day Habit', zh: '21 天习惯' } },
  { key: 'targetAchieve', value: { targetAchieve: {} }, labels: { en: 'Staged Goal', zh: '阶段目标' } },
  { key: 'surpriseTime', value: { surpriseTime: {} }, labels: { en: 'Surprise Moment', zh: '惊喜时刻' } },
];

const statusColorMap: Record<string, string> = {
  pending: 'badge-info',
  proofSubmitted: 'badge-warning',
  approved: 'badge-success',
  rejected: 'badge-error',
  paid: 'badge-success',
};

const defaultStage: StageInput = { title: '', deadline: '', amount: 0 };

const copy = {
  en: {
    formTitle: 'Design a new GlueX mission',
    takerLabel: 'Taker public key',
    takerPlaceholder: 'Destination wallet',
    descriptionLabel: 'Description',
    descriptionPlaceholder: 'Outline the shared mission',
    relationLabel: 'Relationship',
    roomLabel: 'Space',
    eventLabel: 'Event type',
    totalLabel: 'Total incentive (SOL)',
    lockedLabel: 'Locked deposit (SOL)',
    checkpointLabel: 'Checkpoint interval (days)',
    surpriseLabel: 'Surprise trigger date',
    startLabel: 'Start time',
    completionLabel: 'Completion target',
    unlockLabel: 'Unlock time',
    stageSectionTitle: 'Stages & checkpoints',
    stageLabel: 'Stage',
    removeStage: 'Remove',
    stageTitlePlaceholder: 'Short title',
    stageAmountPlaceholder: 'Incentive (SOL)',
    habitHint: 'We will generate three weekly checkpoints with exponential incentives.',
    surpriseHint: 'Surprise events release the full incentive at the trigger time.',
    addStage: 'Add another stage',
    launch: 'Launch mission',
    listTitle: 'Active spaces',
    refresh: 'Refresh',
    emptyBanner: 'Connect your wallet or create a mission to see it here.',
    info: {
      room: 'Room',
      relation: 'Relation',
      completion: 'Completion target',
      unlock: 'Unlock time',
      issuer: 'Issuer',
    },
    incentive: 'Incentive',
    deadline: 'Deadline',
    proofPlaceholder: 'Proof link or note',
    submitProof: 'Submit proof',
    approve: 'Approve & release',
    reject: 'Reject',
    triggerSurprise: 'Trigger surprise payout',
    claimUnused: 'Claim unused balance',
    statusLabels: {
      pending: 'Pending',
      proofSubmitted: 'Proof submitted',
      approved: 'Approved',
      rejected: 'Rejected',
      paid: 'Paid',
    },
    notifications: {
      loadFailed: 'Failed to load goals',
      connectWallet: 'Connect your wallet to create goals',
      invalidTaker: 'Invalid taker public key',
      createSuccess: 'Goal created',
      createFailed: 'Goal creation failed',
      proofMissingLink: 'Add a proof link first',
      proofSubmitted: 'Proof submitted',
      proofFailed: 'Proof submission failed',
      reviewSuccess: 'Incentive released',
      reviewReject: 'Submission rejected',
      reviewFailed: 'Review failed',
      surpriseSuccess: 'Surprise triggered',
      surpriseFailed: 'Trigger failed',
      claimSuccess: 'Unused SOL claimed',
      claimFailed: 'Claim failed',
    },
  },
  zh: {
    formTitle: '创建新的 GlueX 激励任务',
    takerLabel: '执行者公钥',
    takerPlaceholder: '请输入对方钱包地址',
    descriptionLabel: '任务描述',
    descriptionPlaceholder: '写下约定的目标或仪式',
    relationLabel: '关系类型',
    roomLabel: '场景空间',
    eventLabel: '事件类型',
    totalLabel: '总激励（SOL）',
    lockedLabel: '押金（SOL）',
    checkpointLabel: '检查间隔（天）',
    surpriseLabel: '惊喜触发时间',
    startLabel: '开始时间',
    completionLabel: '完成节点',
    unlockLabel: '解锁时间',
    stageSectionTitle: '阶段与检查点',
    stageLabel: '阶段',
    removeStage: '移除',
    stageTitlePlaceholder: '阶段标题',
    stageAmountPlaceholder: '激励金额（SOL）',
    habitHint: '系统会自动生成 3 个逐周增长的检查节点。',
    surpriseHint: '惊喜事件会在指定时间一次性释放全部激励。',
    addStage: '新增阶段',
    launch: '发布任务',
    listTitle: '当前激励空间',
    refresh: '刷新',
    emptyBanner: '连接钱包或创建任务后即可查看列表。',
    info: {
      room: '空间',
      relation: '关系',
      completion: '目标截止',
      unlock: '解锁时间',
      issuer: '发起人',
    },
    incentive: '激励',
    deadline: '截止时间',
    proofPlaceholder: '上传证明链接或备注',
    submitProof: '提交证明',
    approve: '审核并释放',
    reject: '驳回',
    triggerSurprise: '触发惊喜发放',
    claimUnused: '收回剩余押金',
    statusLabels: {
      pending: '待提交',
      proofSubmitted: '待审核',
      approved: '已通过',
      rejected: '已驳回',
      paid: '已发放',
    },
    notifications: {
      loadFailed: '加载目标失败',
      connectWallet: '请先连接钱包再创建任务',
      invalidTaker: '执行者公钥无效',
      createSuccess: '任务已创建',
      createFailed: '创建任务失败',
      proofMissingLink: '请先填写证明链接',
      proofSubmitted: '证明已提交',
      proofFailed: '提交证明失败',
      reviewSuccess: '激励已释放',
      reviewReject: '提交已驳回',
      reviewFailed: '审核失败',
      surpriseSuccess: '惊喜发放成功',
      surpriseFailed: '触发失败',
      claimSuccess: '剩余押金已收回',
      claimFailed: '收回失败',
    },
  },
} as const;

const readEnumKey = (field: any) => {
  if (!field) return 'Unknown';
  return Object.keys(field)[0];
};

const unixToLocale = (value: BN | number) => {
  const ts = BN.isBN(value) ? value.toNumber() : value;
  if (!ts) return '—';
  return new Date(ts * 1000).toLocaleString();
};

const GoalsView: FC = () => {
  const wallet = useWallet();
  const program = useGlueXProgram();
  const { set: pushNotification } = useNotificationStore();
  const { language } = useLanguage();
  const t = copy[language];

  const roomOptions = useMemo(
    () => ROOM_DEFS.map((item) => ({ ...item, label: item.labels[language] })),
    [language],
  );
  const relationOptions = useMemo(
    () => RELATION_DEFS.map((item) => ({ ...item, label: item.labels[language] })),
    [language],
  );
  const eventOptions = useMemo(
    () => EVENT_DEFS.map((item) => ({ ...item, label: item.labels[language] })),
    [language],
  );

  const [takerAddress, setTakerAddress] = useState('');
  const [description, setDescription] = useState('');
  const [room, setRoom] = useState(ROOM_DEFS[0].value);
  const [relations, setRelations] = useState(RELATION_DEFS[3].value);
  const [eventType, setEventType] = useState(EVENT_DEFS[1].value);
  const [totalIncentive, setTotalIncentive] = useState(1);
  const [lockedAmount, setLockedAmount] = useState(0.1);
  const [startDate, setStartDate] = useState('');
  const [completionDate, setCompletionDate] = useState('');
  const [unlockDate, setUnlockDate] = useState('');
  const [surpriseDate, setSurpriseDate] = useState('');
  const [habitIntervalDays, setHabitIntervalDays] = useState(7);
  const [stages, setStages] = useState<StageInput[]>([{ ...defaultStage }]);
  const [proofInputs, setProofInputs] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [goals, setGoals] = useState<any[]>([]);
  const [expandedGoals, setExpandedGoals] = useState<Set<string>>(new Set());
  const [focusedField, setFocusedField] = useState<string | null>(null);

  const isHabit = useMemo(() => !!eventType.habitTraning, [eventType]);
  const isTarget = useMemo(() => !!eventType.targetAchieve, [eventType]);
  const isSurprise = useMemo(() => !!eventType.surpriseTime, [eventType]);

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

  const refreshGoals = useCallback(async () => {
    if (!program || !wallet.publicKey) return;
    try {
      const items = await program.account.totalGoal.all();
      setGoals(
        items.filter(
          (item) =>
            (item.account.issuer as unknown as PublicKey).equals(wallet.publicKey) ||
            (item.account.taker as unknown as PublicKey).equals(wallet.publicKey),
        ),
      );
    } catch (error) {
      console.error(error);
      notify('error', t.notifications.loadFailed, (error as Error).message);
    }
  }, [program, wallet.publicKey, notify, t.notifications.loadFailed]);

  useEffect(() => {
    refreshGoals();
  }, [refreshGoals]);

  const handleAddStage = () => {
    if (stages.length >= 5) return;
    setStages((prev) => [...prev, { ...defaultStage }]);
    // Scroll to the new stage after a brief delay for animation
    setTimeout(() => {
      const stageElements = document.querySelectorAll('[data-stage-card]');
      if (stageElements.length > 0) {
        stageElements[stageElements.length - 1].scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }
    }, 100);
  };

  const toggleGoalExpanded = (goalKey: string) => {
    setExpandedGoals((prev) => {
      const next = new Set(prev);
      if (next.has(goalKey)) {
        next.delete(goalKey);
      } else {
        next.add(goalKey);
      }
      return next;
    });
  };

  const handleStageChange = (index: number, key: keyof StageInput, value: string) => {
    setStages((prev) =>
      prev.map((stage, idx) =>
        idx === index
          ? {
              ...stage,
              [key]: key === 'amount' ? Number(value) : value,
            }
          : stage,
      ),
    );
  };

  const buildSubGoals = () => {
    if (!isTarget) {
      return [];
    }
    return stages
      .filter((stage) => stage.title.trim().length > 0)
      .slice(0, 5)
      .map((stage) => ({
        title: stage.title,
        deadline: new BN(toUnixSeconds(stage.deadline)),
        incentiveAmount: new BN(solToLamports(stage.amount)),
        autoReleaseAt: new BN(0),
      }));
  };

  const goalConfig = () => ({
    startTime: new BN(toUnixSeconds(startDate)),
    surpriseTime: new BN(isSurprise ? toUnixSeconds(surpriseDate) : 0),
    checkpointInterval: new BN(isHabit ? habitIntervalDays * 24 * 3600 : 0),
  });

  const handleCreateGoal = async () => {
    if (!program || !wallet.publicKey) {
      notify('warning', t.notifications.connectWallet);
      return;
    }

    let taker: PublicKey;
    try {
      taker = new PublicKey(takerAddress);
    } catch (error) {
      notify('error', t.notifications.invalidTaker, (error as Error).message);
      return;
    }

    setLoading(true);
    try {
      const [goalsPda] = PublicKey.findProgramAddressSync(
        [Buffer.from('gluex-goals'), wallet.publicKey.toBuffer(), taker.toBuffer()],
        program.programId,
      );

      const totalLamports = solToLamports(totalIncentive);
      const lockedLamports = solToLamports(lockedAmount);
      const completionTime = new BN(toUnixSeconds(completionDate));
      const unlockTime = new BN(toUnixSeconds(unlockDate));

      await program.methods
        .setupGoal(
          taker,
          description,
          room,
          relations,
          eventType,
          buildSubGoals(),
          new BN(totalLamports),
          completionTime,
          new BN(lockedLamports),
          unlockTime,
          goalConfig(),
        )
        .accounts({
          goals: goalsPda,
          payer: wallet.publicKey,
          systemProgram: SystemProgram.programId,
        })
        .rpc();

      notify('success', t.notifications.createSuccess);
      refreshGoals();
    } catch (error) {
      console.error(error);
      notify('error', t.notifications.createFailed, (error as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const submitProof = async (goal: any, index: number) => {
    if (!program || !wallet.publicKey) return;
    const proofKey = `${goal.publicKey.toBase58()}-${index}`;
    const uri = proofInputs[proofKey];
    if (!uri) {
      notify('warning', t.notifications.proofMissingLink);
      return;
    }

    try {
      await program.methods
        .submitProof(index, uri)
        .accounts({
          goals: goal.publicKey,
          taker: wallet.publicKey,
        })
        .rpc();
      notify('success', t.notifications.proofSubmitted, `${t.stageLabel} #${index + 1}`);
      refreshGoals();
    } catch (error) {
      console.error(error);
      notify('error', t.notifications.proofFailed, (error as Error).message);
    }
  };

  const reviewSubgoal = async (goal: any, index: number, approve: boolean) => {
    if (!program || !wallet.publicKey) return;
    try {
      await program.methods
        .reviewSubgoal(index, approve)
        .accounts({
          goals: goal.publicKey,
          issuer: wallet.publicKey,
          takerAccount: goal.account.taker,
        })
        .rpc();
      notify(approve ? 'success' : 'info', approve ? t.notifications.reviewSuccess : t.notifications.reviewReject);
      refreshGoals();
    } catch (error) {
      console.error(error);
      notify('error', t.notifications.reviewFailed, (error as Error).message);
    }
  };

  const triggerSurprise = async (goal: any) => {
    if (!program) return;
    try {
      await program.methods
        .triggerSurprise()
        .accounts({
          goals: goal.publicKey,
          takerAccount: goal.account.taker,
        })
        .rpc();
      notify('success', t.notifications.surpriseSuccess);
      refreshGoals();
    } catch (error) {
      console.error(error);
      notify('error', t.notifications.surpriseFailed, (error as Error).message);
    }
  };

  const claimUnused = async (goal: any) => {
    if (!program || !wallet.publicKey) return;
    try {
      await program.methods
        .claimUnused()
        .accounts({
          goals: goal.publicKey,
          issuer: wallet.publicKey,
        })
        .rpc();
      notify('success', t.notifications.claimSuccess);
      refreshGoals();
    } catch (error) {
      console.error(error);
      notify('error', t.notifications.claimFailed, (error as Error).message);
    }
  };

  const isIssuer = (goal: any) =>
    wallet.publicKey && goal.account.issuer.equals(wallet.publicKey);
  const isTaker = (goal: any) =>
    wallet.publicKey && goal.account.taker.equals(wallet.publicKey);

  const renderSubGoal = (goal: any, subGoal: any, index: number) => {
    if (!subGoal.isActive) return null;
    const statusKey = readEnumKey(subGoal.status).toLowerCase();
    const proofKey = `${goal.publicKey.toBase58()}-${index}`;

    return (
      <div
        key={index}
        className="border border-base-300 rounded-lg p-4 flex flex-col gap-2 transition-all duration-300 hover:border-indigo-500/50 hover:shadow-md bg-gradient-to-br from-base-200/30 to-base-200/10 transform hover:scale-[1.01]"
        style={{ animation: `fadeInLeft 0.3s ease-out ${index * 50}ms both` }}
      >
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-slate-500">{`${t.stageLabel} #${index + 1}`}</p>
            <p className="font-semibold text-base">{decodeFixedString(subGoal.title)}</p>
          </div>
          <span className={`badge ${statusColorMap[statusKey] ?? 'badge-ghost'} animate-pulse`}>
            {t.statusLabels[statusKey as keyof typeof t.statusLabels] ?? statusKey}
          </span>
        </div>
        <p className="text-xs text-slate-400">
          {t.deadline}: {unixToLocale(subGoal.deadline)}
        </p>
        <p className="text-xs text-slate-400">
          {t.incentive}: {lamportsToSol(subGoal.incentiveAmount)} SOL
        </p>
        {isTaker(goal) && ['pending', 'rejected'].includes(statusKey) && (
          <div className="flex flex-col gap-2 mt-2">
            <input
              type="text"
              placeholder={t.proofPlaceholder}
              className="input input-sm input-bordered w-full transition-all duration-200 hover:border-indigo-500/50 focus:border-indigo-500 focus:outline-none"
              value={proofInputs[proofKey] ?? ''}
              onChange={(event) =>
                setProofInputs((prev) => ({ ...prev, [proofKey]: event.target.value }))
              }
            />
            <button
              className="btn btn-primary btn-sm transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-primary/50 active:scale-95"
              onClick={() => submitProof(goal, index)}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {t.submitProof}
            </button>
          </div>
        )}
        {isIssuer(goal) && statusKey === 'proofsubmitted' && (
          <div className="flex gap-2 mt-2">
            <button
              className="btn btn-success btn-sm flex-1 transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-success/50 active:scale-95"
              onClick={() => reviewSubgoal(goal, index, true)}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              {t.approve}
            </button>
            <button
              className="btn btn-outline btn-sm flex-1 transition-all duration-300 hover:scale-105 hover:border-red-500 hover:text-red-400 hover:bg-red-500/10 active:scale-95"
              onClick={() => reviewSubgoal(goal, index, false)}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
              {t.reject}
            </button>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="mx-auto max-w-6xl px-3 sm:px-4 py-8 sm:py-12 space-y-12 sm:space-y-16">
      <section className="space-y-6">
        <div className="rounded-2xl sm:rounded-3xl border border-indigo-500/30 bg-gradient-to-br from-slate-950/70 to-slate-900/60 backdrop-blur-md p-5 sm:p-8 space-y-6 shadow-[0_15px_50px_rgba(79,70,229,0.18)]">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-center bg-clip-text text-transparent bg-gradient-to-r from-indigo-500 to-fuchsia-500">
            {t.formTitle}
          </h1>
          <div className="grid md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <label className="form-control w-full group">
              <span className="label-text text-sm mb-1 transition-colors group-focus-within:text-indigo-400">
                {t.takerLabel}
              </span>
              <div className="relative">
              <input
                type="text"
                placeholder={t.takerPlaceholder}
                  className={`input input-bordered w-full transition-all duration-300 ${
                    focusedField === 'taker'
                      ? 'input-primary border-2 shadow-lg shadow-indigo-500/20'
                      : 'hover:border-indigo-500/50'
                  }`}
                value={takerAddress}
                onChange={(event) => setTakerAddress(event.target.value)}
                  onFocus={() => setFocusedField('taker')}
                  onBlur={() => setFocusedField(null)}
                />
                {takerAddress && (
                  <div className="absolute right-3 top-1/2 -translate-y-1/2">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  </div>
                )}
              </div>
            </label>
            <label className="form-control w-full group">
              <span className="label-text text-sm mb-1 transition-colors group-focus-within:text-indigo-400">
                {t.descriptionLabel}
              </span>
              <div className="relative">
                <textarea
                  className={`textarea textarea-bordered w-full transition-all duration-300 resize-none ${
                    focusedField === 'description'
                      ? 'textarea-primary border-2 shadow-lg shadow-indigo-500/20'
                      : 'hover:border-indigo-500/50'
                  }`}
                  placeholder={t.descriptionPlaceholder}
                  value={description}
                  onChange={(event) => setDescription(event.target.value)}
                  onFocus={() => setFocusedField('description')}
                  onBlur={() => setFocusedField(null)}
                  rows={4}
                />
                {description && (
                  <div className="absolute right-3 top-1/2 -translate-y-1/2">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  </div>
                )}
              </div>
              <div className="label">
                <span className="label-text-alt text-slate-500">{description.length} characters</span>
              </div>
            </label>
            <div className="grid grid-cols-2 gap-4">
              <label className="form-control group">
                <span className="label-text text-sm mb-1 transition-colors group-focus-within:text-indigo-400">
                  {t.relationLabel}
                </span>
                <select
                  className="select select-bordered transition-all duration-300 hover:border-indigo-500/50 focus:border-indigo-500 focus:outline-none"
                  value={JSON.stringify(relations)}
                  onChange={(event) =>
                    setRelations(JSON.parse(event.target.value))
                  }
                >
                  {relationOptions.map((option) => (
                    <option key={option.key} value={JSON.stringify(option.value)}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </label>
              <label className="form-control group">
                <span className="label-text text-sm mb-1 transition-colors group-focus-within:text-indigo-400">
                  {t.roomLabel}
                </span>
                <select
                  className="select select-bordered transition-all duration-300 hover:border-indigo-500/50 focus:border-indigo-500 focus:outline-none"
                  value={JSON.stringify(room)}
                  onChange={(event) => setRoom(JSON.parse(event.target.value))}
                >
                  {roomOptions.map((option) => (
                    <option key={option.key} value={JSON.stringify(option.value)}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </label>
            </div>
            <label className="form-control group">
              <span className="label-text text-sm mb-1 transition-colors group-focus-within:text-indigo-400">
                {t.eventLabel}
              </span>
              <select
                className="select select-bordered transition-all duration-300 hover:border-indigo-500/50 focus:border-indigo-500 focus:outline-none"
                value={JSON.stringify(eventType)}
                onChange={(event) => setEventType(JSON.parse(event.target.value))}
              >
                {eventOptions.map((option) => (
                  <option key={option.key} value={JSON.stringify(option.value)}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>
            <div className="grid grid-cols-2 gap-4">
              <label className="form-control">
                <span className="label-text text-sm">{t.totalLabel}</span>
                <input
                  type="number"
                  min="0"
                  className="input input-bordered"
                  value={totalIncentive}
                  onChange={(event) => setTotalIncentive(Number(event.target.value))}
                />
              </label>
              <label className="form-control">
                <span className="label-text text-sm">{t.lockedLabel}</span>
                <input
                  type="number"
                  min="0"
                  className="input input-bordered"
                  value={lockedAmount}
                  onChange={(event) => setLockedAmount(Number(event.target.value))}
                />
              </label>
            </div>
            {isHabit && (
              <label className="form-control">
                <span className="label-text text-sm">{t.checkpointLabel}</span>
                <input
                  type="number"
                  min="1"
                  className="input input-bordered"
                  value={habitIntervalDays}
                  onChange={(event) => setHabitIntervalDays(Number(event.target.value))}
                />
              </label>
            )}
            {isSurprise && (
              <label className="form-control">
                <span className="label-text text-sm">{t.surpriseLabel}</span>
                <input
                  type="datetime-local"
                  className="input input-bordered"
                  value={surpriseDate}
                  onChange={(event) => setSurpriseDate(event.target.value)}
                />
              </label>
            )}
            <div className="grid grid-cols-3 gap-4">
              <label className="form-control">
                <span className="label-text text-xs">{t.startLabel}</span>
                <input
                  type="datetime-local"
                  className="input input-bordered"
                  value={startDate}
                  onChange={(event) => setStartDate(event.target.value)}
                />
              </label>
              <label className="form-control">
                <span className="label-text text-xs">{t.completionLabel}</span>
                <input
                  type="datetime-local"
                  className="input input-bordered"
                  value={completionDate}
                  onChange={(event) => setCompletionDate(event.target.value)}
                />
              </label>
              <label className="form-control">
                <span className="label-text text-xs">{t.unlockLabel}</span>
                <input
                  type="datetime-local"
                  className="input input-bordered"
                  value={unlockDate}
                  onChange={(event) => setUnlockDate(event.target.value)}
                />
              </label>
            </div>
          </div>
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">{t.stageSectionTitle}</h3>
            {isTarget ? (
              <div className="space-y-3">
                {stages.map((stage, index) => (
                  <div
                    key={index}
                    data-stage-card
                    className="border border-base-300 rounded-lg p-4 space-y-2 transition-all duration-300 hover:border-indigo-500/50 hover:shadow-lg hover:shadow-indigo-500/10 bg-gradient-to-br from-base-200/50 to-base-200/30 transform hover:scale-[1.01]"
                    style={{ animation: `fadeIn 0.3s ease-out ${index * 50}ms both` }}
                  >
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-indigo-500/20 flex items-center justify-center text-xs font-bold text-indigo-400">
                          {index + 1}
                        </div>
                        <p className="text-sm text-slate-400 font-medium">{`${t.stageLabel} #${index + 1}`}</p>
                      </div>
                      {stages.length > 1 && (
                        <button
                          className="btn btn-ghost btn-xs text-red-400 hover:text-red-500 hover:bg-red-500/10 transition-all duration-200"
                          onClick={() => {
                            setStages((prev) => prev.filter((_, idx) => idx !== index));
                          }}
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                          {t.removeStage}
                        </button>
                      )}
                    </div>
                    <input
                      type="text"
                      placeholder={t.stageTitlePlaceholder}
                      className="input input-bordered w-full input-sm transition-all duration-200 hover:border-indigo-500/50 focus:border-indigo-500 focus:outline-none"
                      value={stage.title}
                      onChange={(event) => handleStageChange(index, 'title', event.target.value)}
                    />
                    <input
                      type="datetime-local"
                      className="input input-bordered w-full input-sm transition-all duration-200 hover:border-indigo-500/50 focus:border-indigo-500 focus:outline-none"
                      value={stage.deadline}
                      onChange={(event) => handleStageChange(index, 'deadline', event.target.value)}
                    />
                    <div className="relative">
                    <input
                      type="number"
                      min="0"
                      placeholder={t.stageAmountPlaceholder}
                        className="input input-bordered w-full input-sm transition-all duration-200 hover:border-indigo-500/50 focus:border-indigo-500 focus:outline-none"
                      value={stage.amount}
                      onChange={(event) => handleStageChange(index, 'amount', event.target.value)}
                    />
                      {stage.amount > 0 && (
                        <div className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-indigo-400 font-semibold">
                          SOL
                        </div>
                      )}
                    </div>
                  </div>
                ))}
                {stages.length < 5 && (
                  <button
                    className="btn btn-outline btn-sm w-full border-dashed border-2 border-indigo-500/30 hover:border-indigo-500 hover:bg-indigo-500/10 text-indigo-400 hover:text-indigo-300 transition-all duration-300 group"
                    onClick={handleAddStage}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2 group-hover:rotate-90 transition-transform duration-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    {t.addStage}
                  </button>
                )}
              </div>
            ) : (
              <div className="alert alert-info bg-gradient-to-r from-indigo-500/10 to-fuchsia-500/10 border-indigo-500/20 transition-all duration-300">
                <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current shrink-0 h-6 w-6 text-indigo-400" fill="none" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>{isHabit ? t.habitHint : t.surpriseHint}</span>
              </div>
            )}
            <button
              className={`btn btn-primary w-full transition-all duration-300 ${
                loading ? 'loading' : 'hover:scale-105 hover:shadow-lg hover:shadow-indigo-500/50 active:scale-95'
              } bg-gradient-to-r from-indigo-500 to-fuchsia-500 border-0`}
              onClick={handleCreateGoal}
              disabled={loading}
            >
              {!loading && (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              )}
              {t.launch}
            </button>
          </div>
          </div>
        </div>
      </section>

      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-semibold bg-gradient-to-r from-indigo-400 to-fuchsia-400 bg-clip-text text-transparent">
            {t.listTitle}
          </h2>
          <button
            className="btn btn-sm btn-outline transition-all duration-300 hover:scale-110 hover:border-indigo-500 hover:text-indigo-400 active:scale-95"
            onClick={refreshGoals}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            {t.refresh}
          </button>
        </div>
        {goals.length === 0 && (
          <div className="alert alert-warning bg-gradient-to-r from-yellow-500/10 to-orange-500/10 border-yellow-500/20 transition-all duration-300">
            <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current shrink-0 h-6 w-6 text-yellow-400" fill="none" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <span>{t.emptyBanner}</span>
          </div>
        )}
        <div className="grid md:grid-cols-2 gap-5">
          {goals.map((goal, goalIndex) => {
            const goalKey = goal.publicKey.toBase58();
            const isExpanded = expandedGoals.has(goalKey);
            return (
            <div
              key={goalKey}
              className="rounded-2xl sm:rounded-3xl border border-indigo-500/20 bg-gradient-to-br from-slate-950/60 to-slate-900/40 backdrop-blur-md transition-all duration-300 hover:shadow-xl hover:shadow-indigo-500/20 hover:scale-[1.02] transform overflow-hidden"
              style={{ animation: `fadeInUp 0.4s ease-out ${goalIndex * 100}ms both` }}
            >
              <div className="p-5 sm:p-6 space-y-4">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <h3 className="card-title text-lg bg-gradient-to-r from-indigo-400 to-fuchsia-400 bg-clip-text text-transparent">
                      {goal.account.description}
                    </h3>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="badge badge-outline badge-sm">
                        {readEnumKey(goal.account.eventype)}
                      </span>
                      <span className="text-sm font-semibold text-indigo-400">
                      {lamportsToSol(goal.account.totalIncentiveAmount)} SOL
                      </span>
                    </div>
                  </div>
                  {isIssuer(goal) && (
                    <div className="text-right text-xs text-slate-400 bg-base-300/50 px-2 py-1 rounded">
                      {t.info.issuer}
                      <br />
                      <span className="font-mono">{goal.account.issuer.toBase58().slice(0, 8)}…</span>
                    </div>
                  )}
                </div>
                <button
                  onClick={() => toggleGoalExpanded(goalKey)}
                  className="w-full text-left"
                >
                  <div className={`text-xs text-slate-500 space-y-1 transition-all duration-300 ${isExpanded ? 'max-h-96' : 'max-h-0 overflow-hidden'}`}>
                    <p className="flex items-center gap-2">
                      <span className="w-16 text-slate-400">{t.info.room}:</span>
                      <span className="badge badge-sm">{readEnumKey(goal.account.room)}</span>
                    </p>
                    <p className="flex items-center gap-2">
                      <span className="w-16 text-slate-400">{t.info.relation}:</span>
                      <span className="badge badge-sm">{readEnumKey(goal.account.relations)}</span>
                    </p>
                    <p className="flex items-center gap-2">
                      <span className="w-16 text-slate-400">{t.info.completion}:</span>
                      <span>{unixToLocale(goal.account.completionTime)}</span>
                    </p>
                    <p className="flex items-center gap-2">
                      <span className="w-16 text-slate-400">{t.info.unlock}:</span>
                      <span>{unixToLocale(goal.account.unlockTime)}</span>
                    </p>
                </div>
                  <div className="flex items-center justify-center mt-2 text-xs text-indigo-400">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className={`h-4 w-4 transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`}
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </button>
                <div className="grid gap-3">
                  {goal.account.subGoals.map((subGoal: any, index: number) =>
                    renderSubGoal(goal, subGoal, index),
                  )}
                </div>
                <div className="flex flex-wrap gap-2">
                  {isSurprise && isTaker(goal) && (
                    <button
                      className="btn btn-accent btn-sm transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-accent/50 active:scale-95"
                      onClick={() => triggerSurprise(goal)}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      {t.triggerSurprise}
                    </button>
                  )}
                  {isIssuer(goal) && (
                    <button
                      className="btn btn-outline btn-sm transition-all duration-300 hover:scale-105 hover:border-indigo-500 hover:text-indigo-400 active:scale-95"
                      onClick={() => claimUnused(goal)}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      {t.claimUnused}
                    </button>
                  )}
                </div>
              </div>
            </div>
            );
          })}
        </div>
      </section>
    </div>
  );
};

export { GoalsView };
