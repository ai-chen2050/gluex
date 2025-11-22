// Next, React
import { FC, useEffect } from 'react';
import Link from 'next/link';
import { useWallet, useConnection } from '@solana/wallet-adapter-react';
import { RequestAirdrop } from '../../components/RequestAirdrop';
import pkg from '../../../package.json';
import useUserSOLBalanceStore from '../../stores/useUserSOLBalanceStore';
import { useLanguage } from '../../contexts/LanguageProvider';

const content = {
  en: {
    heroTitle: 'Behavioral incentive rails for every relationship',
    heroSubtitle:
      'Design 21-day habits, staged targets and surprise transfers with automatic verification on Solana.',
    heroCta: 'Launch a mission',
    heroSecondary: 'Understand the design memo',
    highlightHeading: 'Why communities choose GlueX',
    highlights: [
      {
        title: 'Multi-role trust rooms',
        description: 'Capture parent–child, partners, DAO squads or workplace rituals inside one programmable space.',
      },
      {
        title: 'Proof-first automation',
        description: 'Schedule checkpoints, upload evidence, and let the program release deposits only when agreements hold.',
      },
      {
        title: 'Transparent locked vaults',
        description: 'Incentives stay inside PDAs, so every contributor sees how much value is reserved, released or clawed back.',
      },
    ],
    diagramHeading: 'How incentives circulate',
    diagrams: [
      {
        title: 'Value loop',
        description: 'Issuers lock incentives → takers prove progress → verifiers release payouts back to the vault.',
        url: 'https://mermaid.ink/img/eyJjb2RlIjoiJSV7aW5pdDoge1xuICAndGhlbWUnOiAnZGFyaycsXG4gICd0aGVtZVZhcmlhYmxlcyc6IHtcbiAgICAnZGFya01vZGUnOiB0cnVlLFxuICAgICdiYWNrZ3JvdW5kJzogJyMwQTNENjInLFxuICAgICdwcmltYXJ5Q29sb3InOiAnIzYzNjZmMScsXG4gICAgJ3ByaW1hcnlUZXh0Q29sb3InOiAnI2ZmZmZmZicsXG4gICAgJ3ByaW1hcnlCb3JkZXJDb2xvcic6ICcjYTg1NWY3JyxcbiAgICAnbGluZUNvbG9yJzogJyNhODU1ZjcnLFxuICAgICdzZWNvbmRhcnlDb2xvcic6ICcjMzEyZTgxJyxcbiAgICAndGVydGlhcnlDb2xvcic6ICcjNzAxYTc1JyxcbiAgICAnbm9kZUJvcmRlcic6ICcjYTg1NWY3JyxcbiAgICAnZm9udEZhbWlseSc6ICdtb25vc3BhY2UnLFxuICAgICdmb250U2l6ZSc6ICcxNnB4J1xuICB9XG59fSUlXG5ncmFwaCBURFxuICAgIEFbSXNzdWVyXSAtLT4gQltHb2FsVmF1bHRdXG4gICAgQiAtLT4gQ1tUYWtlcl1cbiAgICBDIC0tPiBEW1Byb29mXVxuICAgIEQgLS0-IEVbVmVyaWZpZXJdXG4gICAgRSAtLT4gQlxuICAgIFxuICAgIHN0eWxlIEEgZmlsbDojNjM2NmYxLHN0cm9rZTojYTg1NWY3LHN0cm9rZS13aWR0aDoycHgsY29sb3I6I2ZmZmZmZlxuICAgIHN0eWxlIEIgZmlsbDojNjM2NmYxLHN0cm9rZTojYTg1NWY3LHN0cm9rZS13aWR0aDoycHgsY29sb3I6I2ZmZmZmZlxuICAgIHN0eWxlIEMgZmlsbDojMzEyZTgxLHN0cm9rZTojYTg1NWY3LHN0cm9rZS13aWR0aDoycHgsY29sb3I6I2ZmZmZmZlxuICAgIHN0eWxlIEQgZmlsbDojMzEyZTgxLHN0cm9rZTojYTg1NWY3LHN0cm9rZS13aWR0aDoycHgsY29sb3I6I2ZmZmZmZlxuICAgIHN0eWxlIEUgZmlsbDojNzAxYTc1LHN0cm9rZTojYTg1NWY3LHN0cm9rZS13aWR0aDoycHgsY29sb3I6I2ZmZmZmZiIsIm1lcm1haWQiOnsidGhlbWUiOiJkYXJrIiwidGhlbWVWYXJpYWJsZXMiOnsiZGFya01vZGUiOnRydWUsImJhY2tncm91bmQiOiIjMDAwMDAwIiwicHJpbWFyeUNvbG9yIjoiIzYzNjZmMSIsInByaW1hcnlUZXh0Q29sb3IiOiIjZmZmZmZmIiwicHJpbWFyeUJvcmRlckNvbG9yIjoiI2E4NTVmNyIsImxpbmVDb2xvciI6IiNhODU1ZjciLCJzZWNvbmRhcnlDb2xvciI6IiMzMTJlODEiLCJ0ZXJ0aWFyeUNvbG9yIjoiIzcwMWE3NSIsIm5vZGVCb3JkZXIiOiIjYTg1NWY3IiwiZm9udEZhbWlseSI6Im1vbm9zcGFjZSIsImZvbnRTaXplIjoiMTZweCJ9fX0?theme=dark&bgColor=000000',
      },
      {
        title: 'Spaces & rituals',
        description: 'Role spaces orchestrate habits, staged targets and surprise moments inside the same automation engine.',
        url: 'https://mermaid.ink/img/eyJjb2RlIjoiJSV7aW5pdDoge1xuICAndGhlbWUnOiAnZGFyaycsXG4gICd0aGVtZVZhcmlhYmxlcyc6IHtcbiAgICAnZGFya01vZGUnOiB0cnVlLFxuICAgICdiYWNrZ3JvdW5kJzogJyMwQTNENjInLFxuICAgICdwcmltYXJ5Q29sb3InOiAnIzYzNjZmMScsXG4gICAgJ3ByaW1hcnlUZXh0Q29sb3InOiAnI2ZmZmZmZicsXG4gICAgJ3ByaW1hcnlCb3JkZXJDb2xvcic6ICcjYTg1NWY3JyxcbiAgICAnbGluZUNvbG9yJzogJyNhODU1ZjcnLFxuICAgICdzZWNvbmRhcnlDb2xvcic6ICcjMzEyZTgxJyxcbiAgICAndGVydGlhcnlDb2xvcic6ICcjNzAxYTc1JyxcbiAgICAnbm9kZUJvcmRlcic6ICcjYTg1NWY3JyxcbiAgICAnZm9udEZhbWlseSc6ICdtb25vc3BhY2UnLFxuICAgICdmb250U2l6ZSc6ICcxNnB4J1xuICB9XG59fSUlXG5ncmFwaCBURFxuICAgIEFbVXNlcl0gLS0-IEJbUm9sZVNwYWNlXVxuICAgIEIgLS0-IENbSGFiaXRdXG4gICAgQiAtLT4gRFtUYXJnZXRzXVxuICAgIEIgLS0-IEVbU3VycHJpc2VdXG4gICAgQyAtLT4gRltWZXJpZmllcl1cbiAgICBEIC0tPiBGW1ZlcmlmaWVyXVxuICAgIEUgLS0-IEdbVmF1bHRdXG4gICAgXG4gICAgc3R5bGUgQSBmaWxsOiM2MzY2ZjEsc3Ryb2tlOiNhODU1Zjcsc3Ryb2tlLXdpZHRoOjJweCxjb2xvcjojZmZmZmZmXG4gICAgc3R5bGUgQiBmaWxsOiM2MzY2ZjEsc3Ryb2tlOiNhODU1Zjcsc3Ryb2tlLXdpZHRoOjJweCxjb2xvcjojZmZmZmZmXG4gICAgc3R5bGUgQyBmaWxsOiMzMTJlODEsc3Ryb2tlOiNhODU1Zjcsc3Ryb2tlLXdpZHRoOjJweCxjb2xvcjojZmZmZmZmXG4gICAgc3R5bGUgRCBmaWxsOiMzMTJlODEsc3Ryb2tlOiNhODU1Zjcsc3Ryb2tlLXdpZHRoOjJweCxjb2xvcjojZmZmZmZmXG4gICAgc3R5bGUgRSBmaWxsOiMzMTJlODEsc3Ryb2tlOiNhODU1Zjcsc3Ryb2tlLXdpZHRoOjJweCxjb2xvcjojZmZmZmZmXG4gICAgc3R5bGUgRiBmaWxsOiM3MDFhNzUsc3Ryb2tlOiNhODU1Zjcsc3Ryb2tlLXdpZHRoOjJweCxjb2xvcjojZmZmZmZmXG4gICAgc3R5bGUgRyBmaWxsOiM3MDFhNzUsc3Ryb2tlOiNhODU1Zjcsc3Ryb2tlLXdpZHRoOjJweCxjb2xvcjojZmZmZmZmIiwibWVybWFpZCI6eyJ0aGVtZSI6ImRhcmsiLCJ0aGVtZVZhcmlhYmxlcyI6eyJkYXJrTW9kZSI6dHJ1ZSwiYmFja2dyb3VuZCI6IiMwMDAwMDAiLCJwcmltYXJ5Q29sb3IiOiIjNjM2NmYxIiwicHJpbWFyeVRleHRDb2xvciI6IiNmZmZmZmYiLCJwcmltYXJ5Qm9yZGVyQ29sb3IiOiIjYTg1NWY3IiwibGluZUNvbG9yIjoiI2E4NTVmNyIsInNlY29uZGFyeUNvbG9yIjoiIzMxMmU4MSIsInRlcnRpYXJ5Q29sb3IiOiIjNzAxYTc1Iiwibm9kZUJvcmRlciI6IiNhODU1ZjciLCJmb250RmFtaWx5IjoibW9ub3NwYWNlIiwiZm9udFNpemUiOiIxNnB4In19fQ?theme=dark&bgColor=000000',
      },
    ],
    inspirationHeading: 'Vision & mechanism',
    inspirationBody:
      'GlueX emphasises negotiation, shared responsibility, and transparent incentives. Participants co-create milestones, lock deposits, and reclaim unused value when goals are completed or forfeited.',
    galleryHeading: 'Product snapshots',
    galleryCaptions: ['Goal orchestration', 'Collective habit board', 'Automated payout console'],
    ctaTitle: 'Ready to co-create incentives?',
    ctaSubtitle: 'Jump into the Goals workspace to craft a multi-stage ritual for your team or family.',
    ctaButton: 'Open Goals workspace',
  },
  zh: {
    heroTitle: 'GlueX：面向多角色关系的行为激励新范式',
    heroSubtitle: '21 天习惯、阶段性目标与惊喜时刻都可自动验证、自动结算，保障双方协商结果。',
    heroCta: '立即创建激励计划',
    heroSecondary: '查看设计思路',
    highlightHeading: '为什么选择 GlueX',
    highlights: [
      {
        title: '多角色信任空间',
        description: '亲子、情侣、团队或 DAO 小组都能在同一个自动化空间内定义目标与激励。',
      },
      {
        title: '证据优先的自动化',
        description: '设置检查节点、上传完成证明，程序按照规则发放或终止后续奖励。',
      },
      {
        title: '透明的托管金库',
        description: '激励金托管在 PDA 中，所有参与者都能看到剩余金额、已释放金额与解锁时间。',
      },
    ],
    diagramHeading: '价值如何流转',
    diagrams: [
      {
        title: '价值闭环',
        description: '发起人锁定激励 → 执行者提交证明 → 验证者审核并释放，所有动作可审计。',
        url: 'https://mermaid.ink/img/eyJjb2RlIjoiJSV7aW5pdDoge1xuICAndGhlbWUnOiAnZGFyaycsXG4gICd0aGVtZVZhcmlhYmxlcyc6IHtcbiAgICAnZGFya01vZGUnOiB0cnVlLFxuICAgICdiYWNrZ3JvdW5kJzogJyMwQTNENjInLFxuICAgICdwcmltYXJ5Q29sb3InOiAnIzYzNjZmMScsXG4gICAgJ3ByaW1hcnlUZXh0Q29sb3InOiAnI2ZmZmZmZicsXG4gICAgJ3ByaW1hcnlCb3JkZXJDb2xvcic6ICcjYTg1NWY3JyxcbiAgICAnbGluZUNvbG9yJzogJyNhODU1ZjcnLFxuICAgICdzZWNvbmRhcnlDb2xvcic6ICcjMzEyZTgxJyxcbiAgICAndGVydGlhcnlDb2xvcic6ICcjNzAxYTc1JyxcbiAgICAnbm9kZUJvcmRlcic6ICcjYTg1NWY3JyxcbiAgICAnZm9udEZhbWlseSc6ICdtb25vc3BhY2UnLFxuICAgICdmb250U2l6ZSc6ICcxNnB4J1xuICB9XG59fSUlXG5ncmFwaCBURFxuICAgIEFbSXNzdWVyXSAtLT4gQltHb2FsVmF1bHRdXG4gICAgQiAtLT4gQ1tUYWtlcl1cbiAgICBDIC0tPiBEW1Byb29mXVxuICAgIEQgLS0-IEVbVmVyaWZpZXJdXG4gICAgRSAtLT4gQlxuICAgIFxuICAgIHN0eWxlIEEgZmlsbDojNjM2NmYxLHN0cm9rZTojYTg1NWY3LHN0cm9rZS13aWR0aDoycHgsY29sb3I6I2ZmZmZmZlxuICAgIHN0eWxlIEIgZmlsbDojNjM2NmYxLHN0cm9rZTojYTg1NWY3LHN0cm9rZS13aWR0aDoycHgsY29sb3I6I2ZmZmZmZlxuICAgIHN0eWxlIEMgZmlsbDojMzEyZTgxLHN0cm9rZTojYTg1NWY3LHN0cm9rZS13aWR0aDoycHgsY29sb3I6I2ZmZmZmZlxuICAgIHN0eWxlIEQgZmlsbDojMzEyZTgxLHN0cm9rZTojYTg1NWY3LHN0cm9rZS13aWR0aDoycHgsY29sb3I6I2ZmZmZmZlxuICAgIHN0eWxlIEUgZmlsbDojNzAxYTc1LHN0cm9rZTojYTg1NWY3LHN0cm9rZS13aWR0aDoycHgsY29sb3I6I2ZmZmZmZiIsIm1lcm1haWQiOnsidGhlbWUiOiJkYXJrIiwidGhlbWVWYXJpYWJsZXMiOnsiZGFya01vZGUiOnRydWUsImJhY2tncm91bmQiOiIjMDAwMDAwIiwicHJpbWFyeUNvbG9yIjoiIzYzNjZmMSIsInByaW1hcnlUZXh0Q29sb3IiOiIjZmZmZmZmIiwicHJpbWFyeUJvcmRlckNvbG9yIjoiI2E4NTVmNyIsImxpbmVDb2xvciI6IiNhODU1ZjciLCJzZWNvbmRhcnlDb2xvciI6IiMzMTJlODEiLCJ0ZXJ0aWFyeUNvbG9yIjoiIzcwMWE3NSIsIm5vZGVCb3JkZXIiOiIjYTg1NWY3IiwiZm9udEZhbWlseSI6Im1vbm9zcGFjZSIsImZvbnRTaXplIjoiMTZweCJ9fX0?theme=dark&bgColor=000000',
      },
      {
        title: '场景与仪式',
        description: '不同角色空间可以同时运行习惯打卡、阶段目标与惊喜时刻，统一通过合约调度。',
        url: 'https://mermaid.ink/img/eyJjb2RlIjoiJSV7aW5pdDoge1xuICAndGhlbWUnOiAnZGFyaycsXG4gICd0aGVtZVZhcmlhYmxlcyc6IHtcbiAgICAnZGFya01vZGUnOiB0cnVlLFxuICAgICdiYWNrZ3JvdW5kJzogJyMwQTNENjInLFxuICAgICdwcmltYXJ5Q29sb3InOiAnIzYzNjZmMScsXG4gICAgJ3ByaW1hcnlUZXh0Q29sb3InOiAnI2ZmZmZmZicsXG4gICAgJ3ByaW1hcnlCb3JkZXJDb2xvcic6ICcjYTg1NWY3JyxcbiAgICAnbGluZUNvbG9yJzogJyNhODU1ZjcnLFxuICAgICdzZWNvbmRhcnlDb2xvcic6ICcjMzEyZTgxJyxcbiAgICAndGVydGlhcnlDb2xvcic6ICcjNzAxYTc1JyxcbiAgICAnbm9kZUJvcmRlcic6ICcjYTg1NWY3JyxcbiAgICAnZm9udEZhbWlseSc6ICdtb25vc3BhY2UnLFxuICAgICdmb250U2l6ZSc6ICcxNnB4J1xuICB9XG59fSUlXG5ncmFwaCBURFxuICAgIEFbVXNlcl0gLS0-IEJbUm9sZVNwYWNlXVxuICAgIEIgLS0-IENbSGFiaXRdXG4gICAgQiAtLT4gRFtUYXJnZXRzXVxuICAgIEIgLS0-IEVbU3VycHJpc2VdXG4gICAgQyAtLT4gRltWZXJpZmllcl1cbiAgICBEIC0tPiBGW1ZlcmlmaWVyXVxuICAgIEUgLS0-IEdbVmF1bHRdXG4gICAgXG4gICAgc3R5bGUgQSBmaWxsOiM2MzY2ZjEsc3Ryb2tlOiNhODU1Zjcsc3Ryb2tlLXdpZHRoOjJweCxjb2xvcjojZmZmZmZmXG4gICAgc3R5bGUgQiBmaWxsOiM2MzY2ZjEsc3Ryb2tlOiNhODU1Zjcsc3Ryb2tlLXdpZHRoOjJweCxjb2xvcjojZmZmZmZmXG4gICAgc3R5bGUgQyBmaWxsOiMzMTJlODEsc3Ryb2tlOiNhODU1Zjcsc3Ryb2tlLXdpZHRoOjJweCxjb2xvcjojZmZmZmZmXG4gICAgc3R5bGUgRCBmaWxsOiMzMTJlODEsc3Ryb2tlOiNhODU1Zjcsc3Ryb2tlLXdpZHRoOjJweCxjb2xvcjojZmZmZmZmXG4gICAgc3R5bGUgRSBmaWxsOiMzMTJlODEsc3Ryb2tlOiNhODU1Zjcsc3Ryb2tlLXdpZHRoOjJweCxjb2xvcjojZmZmZmZmXG4gICAgc3R5bGUgRiBmaWxsOiM3MDFhNzUsc3Ryb2tlOiNhODU1Zjcsc3Ryb2tlLXdpZHRoOjJweCxjb2xvcjojZmZmZmZmXG4gICAgc3R5bGUgRyBmaWxsOiM3MDFhNzUsc3Ryb2tlOiNhODU1Zjcsc3Ryb2tlLXdpZHRoOjJweCxjb2xvcjojZmZmZmZmIiwibWVybWFpZCI6eyJ0aGVtZSI6ImRhcmsiLCJ0aGVtZVZhcmlhYmxlcyI6eyJkYXJrTW9kZSI6dHJ1ZSwiYmFja2dyb3VuZCI6IiMwMDAwMDAiLCJwcmltYXJ5Q29sb3IiOiIjNjM2NmYxIiwicHJpbWFyeVRleHRDb2xvciI6IiNmZmZmZmYiLCJwcmltYXJ5Qm9yZGVyQ29sb3IiOiIjYTg1NWY3IiwibGluZUNvbG9yIjoiI2E4NTVmNyIsInNlY29uZGFyeUNvbG9yIjoiIzMxMmU4MSIsInRlcnRpYXJ5Q29sb3IiOiIjNzAxYTc1Iiwibm9kZUJvcmRlciI6IiNhODU1ZjciLCJmb250RmFtaWx5IjoibW9ub3NwYWNlIiwiZm9udFNpemUiOiIxNnB4In19fQ?theme=dark&bgColor=000000',
      },
    ],
    inspirationHeading: '愿景与机制',
    inspirationBody:
      'GlueX 鼓励双方先协商再自动执行：共同定义阶段、锁定押金、按验证结果释放或回收剩余价值，从源头减少纠纷。',
    galleryHeading: '产品快照',
    galleryCaptions: ['目标编排', '习惯驱动看板', '自动结算面板'],
    ctaTitle: '立即开启共创激励之旅',
    ctaSubtitle: '前往 Goals 工作台，几分钟内搭建一套可验证、可结算的激励体验。',
    ctaButton: '进入 Goals 工作台',
  },
};

export const HomeView: FC = () => {
  const wallet = useWallet();
  const { connection } = useConnection();
  const { language } = useLanguage();
  const t = content[language];

  const balance = useUserSOLBalanceStore((s) => s.balance);
  const { getUserSOLBalance } = useUserSOLBalanceStore();

  useEffect(() => {
    if (wallet.publicKey) {
      getUserSOLBalance(wallet.publicKey, connection);
    }
  }, [wallet.publicKey, connection, getUserSOLBalance]);

  const galleryImages = [
    {
      src: 'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?auto=format&fit=crop&w=800&q=80',
      caption: t.galleryCaptions[0],
    },
    {
      src: 'https://images.unsplash.com/photo-1529333166437-7750a6dd5a70?auto=format&fit=crop&w=800&q=80',
      caption: t.galleryCaptions[1],
    },
    {
      src: 'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=800&q=80',
      caption: t.galleryCaptions[2],
    },
  ];

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 space-y-12">
      <section className="grid gap-8 md:grid-cols-2 items-center">
        <div className="space-y-6">
          <div className="text-sm text-slate-500">v{pkg.version}</div>
          <h1 className="text-4xl md:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-br from-indigo-500 to-fuchsia-500">
            {t.heroTitle}
          </h1>
          <p className="text-lg text-slate-300 leading-relaxed">{t.heroSubtitle}</p>
          <div className="flex flex-wrap gap-4">
            <Link href="/goals" className="btn btn-primary">
              {t.heroCta}
            </Link>
            <Link href="https://github.com/ai-chen2050/gluex" target="_blank" className="btn btn-outline">
              {t.heroSecondary}
            </Link>
          </div>
        </div>
        <div className="rounded-3xl border border-base-300 bg-base-200/60 p-6 shadow-lg space-y-4">
          <RequestAirdrop />
          <div className="text-3xl font-semibold text-center">
            {wallet.publicKey ? (balance || 0).toLocaleString() : '—'}
            <span className="text-base text-slate-500 ml-2">SOL</span>
          </div>
          <p className="text-center text-sm text-slate-400">
            {wallet.publicKey ? wallet.publicKey.toBase58() : 'Connect a wallet to preview live balances.'}
          </p>
          <div className="mockup-code bg-base-300 text-left">
            <pre data-prefix=">">
              <code>gluex launch --habit 21d --proof auto</code>
            </pre>
            <pre data-prefix=">" className="text-warning">
              <code>await vault.release()</code>
            </pre>
            <pre data-prefix=">" className="text-success">
              <code># incentives routed ✔</code>
            </pre>
          </div>
        </div>
      </section>

      <section className="space-y-6">
        <h2 className="text-2xl font-semibold">{t.highlightHeading}</h2>
        <div className="grid gap-6 md:grid-cols-3">
          {t.highlights.map((card) => (
            <div key={card.title} className="rounded-2xl border border-base-300 bg-base-200/60 p-5 space-y-3">
              <h3 className="text-xl font-semibold">{card.title}</h3>
              <p className="text-sm text-slate-400">{card.description}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="space-y-6">
        <h2 className="text-2xl font-semibold">{t.diagramHeading}</h2>
        <div className="grid gap-6 md:grid-cols-2">
          {t.diagrams.map((diagram) => (
            <div key={diagram.title} className="rounded-3xl border border-base-300 bg-base-200/50 p-5 space-y-3">
              <img src={diagram.url} alt={diagram.title} className="w-full rounded-2xl bg-base-100 max-h-96 object-contain" />
              <h3 className="text-lg font-semibold">{diagram.title}</h3>
              <p className="text-sm text-slate-400">{diagram.description}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">{t.inspirationHeading}</h2>
        <p className="text-slate-300 leading-relaxed">{t.inspirationBody}</p>
      </section>

      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">{t.galleryHeading}</h2>
        <div className="grid gap-4 md:grid-cols-3">
          {galleryImages.map((item) => (
            <figure key={item.caption} className="rounded-2xl overflow-hidden border border-base-300">
              <img src={item.src} alt={item.caption} className="w-full h-48 object-cover" />
              <figcaption className="p-3 text-sm text-slate-400">{item.caption}</figcaption>
            </figure>
          ))}
        </div>
      </section>

      <section className="rounded-3xl border border-fuchsia-500/30 bg-gradient-to-br from-indigo-900/40 to-fuchsia-900/20 p-8 text-center space-y-4">
        <h3 className="text-3xl font-semibold">{t.ctaTitle}</h3>
        <p className="text-slate-300">{t.ctaSubtitle}</p>
        <Link href="/goals" className="btn btn-secondary">
          {t.ctaButton}
        </Link>
      </section>
    </div>
  );
};
