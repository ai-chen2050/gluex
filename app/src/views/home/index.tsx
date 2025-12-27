// Next, React
import { FC, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useWallet, useConnection } from '@solana/wallet-adapter-react';
import { RequestAirdrop } from '../../components/RequestAirdrop';
import pkg from '../../../package.json';
import useUserSOLBalanceStore from '../../stores/useUserSOLBalanceStore';
import { useLanguage } from '../../contexts/LanguageProvider';

const content = {
  en: {
    heroEyebrow: 'On-chain incentive rail',
    heroTitle: 'Connecting everyone with Crypto glue through GlueX \nEmbrace the Future of Behavioral incentive 💰',
    heroSubtitle:
      'Behavioral incentive rails for every relationship.\nDesign 21-day habits, staged targets and surprise transfers with automatic verification on Solana.',
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
    heroEyebrow: '链上激励底座',
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

  // Prepare hero title pieces so we can insert the rotating earth after "through GlueX"
  const heroMarker = 'through GlueX';
  let heroBefore = t.heroTitle;
  let heroMarkerText = '';
  let heroAfter = '';
  if (t.heroTitle.includes(heroMarker)) {
    const parts = t.heroTitle.split(heroMarker);
    heroBefore = parts[0];
    heroMarkerText = heroMarker;
    heroAfter = parts.slice(1).join(heroMarker);
  } else if (t.heroTitle.includes('\n')) {
    // Fallback: insert after the first line for languages without the exact marker
    const parts = t.heroTitle.split('\n');
    heroBefore = parts[0];
    heroMarkerText = '';
    heroAfter = '\n' + parts.slice(1).join('\n');
  }

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
    <div className="mx-auto max-w-6xl px-3 sm:px-4 py-8 sm:py-12 space-y-12 sm:space-y-16">
      {/* Hero Section */}
      <section className="flex flex-col gap-4 sm:gap-6">
        <div className="rounded-2xl sm:rounded-3xl border border-indigo-500/30 bg-gradient-to-br from-slate-950/80 to-slate-900/80 backdrop-blur-md p-5 sm:p-10 text-center space-y-3 sm:space-y-5 shadow-[0_15px_50px_rgba(79,70,229,0.25)] sm:shadow-[0_25px_100px_rgba(79,70,229,0.35)]">
          <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3 text-xs sm:text-sm uppercase tracking-[0.2em] sm:tracking-[0.3em] text-indigo-300 font-semibold">
            <span className="inline-flex items-center gap-1.5 sm:gap-2 rounded-full border border-indigo-500/50 bg-indigo-500/15 px-3 sm:px-4 py-1 sm:py-1.5 text-[11px] sm:text-[12px] font-semibold backdrop-blur-sm hover:bg-indigo-500/25 transition-all">
              <span className="h-1.5 w-1.5 sm:h-2 sm:w-2 rounded-full bg-fuchsia-400 animate-pulse" />
              {t.heroEyebrow}
            </span>
            <span className="text-slate-500 text-xs sm:text-sm">v{pkg.version}</span>
          </div>
          <div className="space-y-1.5 sm:space-y-3">
            <h1 className="text-3xl sm:text-4xl md:text-6xl lg:text-6xl font-black tracking-tight leading-tight flex items-center gap-1 justify-center">
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-green-500 relative inline-block transition-all duration-500 hover:scale-110">
                G
                <span className="absolute top-1/4 left-1/3 w-1.5 h-1.5 bg-green-700 rounded-sm"></span>
              </span>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-purple-500 relative inline-block transition-all duration-500 hover:scale-110 delay-100">
                l
                <span className="absolute bottom-0 left-0 w-1.5 h-2 bg-blue-800 rounded-sm"></span>
              </span>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-purple-500 transition-all duration-500 hover:scale-110 delay-200">u</span>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-red-500 relative inline-block transition-all duration-500 hover:scale-110 delay-300">
                e
                <span className="absolute bottom-1/4 right-1/3 w-1.5 h-1.5 bg-green-600 rounded-sm"></span>
              </span>
              <span className="text-white transition-all duration-500 hover:scale-110 delay-400">X</span>
            </h1>
            <div className="flex items-center justify-center gap-3">
              <h2 className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold text-white whitespace-pre-line leading-snug text-balance">
                {heroBefore}
                {heroMarkerText && (
                  <>
                    {heroMarkerText}
                    <button
                      type="button"
                      title="Rotate Earth"
                      aria-label="rotate-earth"
                      className="inline-block ml-0 sm:ml-1 p-1 rounded-full hover:bg-white/5 transition"
                    >
                      <span
                        className="rotating inline-block text-2xl sm:text-5xl transform transition duration-500 hover:scale-110"
                        aria-hidden
                      >
                        🌏
                      </span>
                    </button>
                  </>
                )}
                {!heroMarkerText && (
                  // if marker not found, place the earth at the end of the first line
                  <button
                    type="button"
                    title="Rotate Earth"
                    aria-label="rotate-earth"
                    className="inline-block ml-0 sm:ml-1 p-1 rounded-full hover:bg-white/5 transition"
                  >
                    <span
                      className="rotating inline-block text-2xl sm:text-5xl transform transition duration-500 hover:scale-110"
                      aria-hidden
                    >
                      🌏
                    </span>
                  </button>
                )}
                {heroAfter}
                {/* scoped keyframes to make the earth rotate continuously */}
                <style jsx>{`
                .rotating {
                  /* continuous slow rotation; adjust duration as desired */
                  animation: spin 8s linear infinite;
                }
                @keyframes spin {
                  from {
                  transform: rotate(0deg);
                  }
                  to {
                  transform: rotate(360deg);
                  }
                }
                `}</style>
              </h2>
            </div>
          </div>
          <p className="text-xs sm:text-sm md:text-base lg:text-lg text-slate-200 leading-relaxed max-w-3xl mx-auto whitespace-pre-line text-balance">
            {t.heroSubtitle}
          </p>
          <div className="flex flex-col sm:flex-row flex-wrap gap-2 sm:gap-3 justify-center pt-1 sm:pt-2">
            <Link
              href="/goals"
              className="btn btn-sm sm:btn-md px-4 sm:px-8 py-2 sm:py-3 font-bold bg-gradient-to-r from-indigo-500 to-fuchsia-500 text-white border-0 shadow-[0_4px_12px_rgba(136,58,255,0.2)] sm:shadow-[0_8px_24px_rgba(136,58,255,0.3)] hover:shadow-[0_8px_20px_rgba(136,58,255,0.3)] sm:hover:shadow-[0_12px_32px_rgba(136,58,255,0.4)] hover:from-indigo-400 hover:to-fuchsia-400 transition-all duration-200 transform hover:scale-105 active:scale-95 text-xs sm:text-base"
            >
              {t.heroCta}
            </Link>
            <Link
              href="https://github.com/ai-chen2050/gluex"
              target="_blank"
              className="btn btn-sm sm:btn-md px-4 sm:px-8 py-2 sm:py-3 font-semibold text-slate-200 border border-slate-600/50 bg-slate-900/40 hover:bg-slate-800/60 hover:text-white hover:border-indigo-500/50 transition-all duration-200 transform hover:scale-105 active:scale-95 backdrop-blur-sm text-xs sm:text-base"
            >
              {t.heroSecondary}
            </Link>
          </div>
        </div>

        {/* Wallet Balance Card */}
        <div className="rounded-2xl sm:rounded-3xl border border-indigo-500/20 bg-gradient-to-br from-slate-950/60 to-slate-900/60 backdrop-blur-md p-6 sm:p-10 shadow-[0_15px_50px_rgba(79,70,229,0.15)] sm:shadow-[0_20px_70px_rgba(79,70,229,0.2)] space-y-4 sm:space-y-6 max-w-2xl w-full mx-auto">
          <RequestAirdrop />
          <div className="space-y-1.5 sm:space-y-2">
            <div className="text-3xl sm:text-4xl md:text-5xl font-bold text-center text-transparent bg-clip-text bg-gradient-to-r from-indigo-300 to-fuchsia-300 leading-tight">
              {wallet.publicKey ? (balance || 0).toLocaleString() : '—'}
              <span className="text-base text-2xl sm:text-2xl md:text-2xl ml-2">SOL</span>
            </div>
            <div className="text-center text-xs sm:text-sm text-slate-400">SOL Balance</div>
          </div>
          <p className="text-center text-xs sm:text-sm text-slate-500 break-all line-clamp-2">
            {wallet.publicKey ? wallet.publicKey.toBase58() : 'Connect a wallet to preview live balances.'}
          </p>
          <div className="mockup-code bg-slate-900/80 text-left rounded-lg sm:rounded-xl border border-slate-700/50 text-xs sm:text-sm overflow-hidden">
            <pre data-prefix="$">
              <code className="text-indigo-300">gluex launch --habit 21d --proof auto</code>
            </pre>
            <pre data-prefix=">">
              <code className="text-fuchsia-300">await vault.release()</code>
            </pre>
            <pre data-prefix=">" className="text-success text-emerald-400">
              <code># incentives routed ✔</code>
            </pre>

          </div>
        </div>
      </section>

      {/* Highlights Section */}
      <section className="space-y-6 sm:space-y-8">
        <div className="space-y-2">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white">{t.highlightHeading}</h2>
          <div className="h-1 w-12 bg-gradient-to-r from-indigo-500 to-fuchsia-500 rounded-full"></div>
        </div>
        <div className="grid gap-4 sm:gap-6 md:grid-cols-3">
          {t.highlights.map((card, idx) => (
            <div
              key={card.title}
              className="group relative rounded-xl sm:rounded-2xl border border-indigo-500/20 bg-gradient-to-br from-slate-950/60 to-slate-900/40 backdrop-blur-md p-4 sm:p-6 space-y-2 sm:space-y-4 shadow-[0_10px_40px_rgba(79,70,229,0.1)] hover:shadow-[0_20px_60px_rgba(136,58,255,0.2)] transition-all duration-300 hover:border-indigo-500/40 hover:from-slate-950/80 hover:to-slate-900/60 overflow-hidden"
            >
              <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500/10 to-fuchsia-500/10 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 -z-10"></div>
              <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-gradient-to-br from-indigo-500/20 to-fuchsia-500/20 flex items-center justify-center text-base sm:text-lg font-bold text-indigo-300 group-hover:from-indigo-500/40 group-hover:to-fuchsia-500/40 transition-colors flex-shrink-0">
                {idx + 1}
              </div>
              <h3 className="text-base sm:text-lg font-bold text-white group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-indigo-300 group-hover:to-fuchsia-300 transition-all">{card.title}</h3>
              <p className="text-xs sm:text-sm text-slate-400 group-hover:text-slate-300 transition-colors leading-relaxed">{card.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Diagrams Section */}
      <section className="space-y-6 sm:space-y-8">
        <div className="space-y-2">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white">{t.diagramHeading}</h2>
          <div className="h-1 w-12 bg-gradient-to-r from-indigo-500 to-fuchsia-500 rounded-full"></div>
        </div>
        <div className="grid gap-4 sm:gap-6 md:grid-cols-2">
          {t.diagrams.map((diagram) => (
            <div
              key={diagram.title}
              className="group rounded-2xl sm:rounded-3xl border border-indigo-500/20 bg-gradient-to-br from-slate-950/60 to-slate-900/40 backdrop-blur-md p-4 sm:p-6 space-y-3 sm:space-y-4 shadow-[0_10px_40px_rgba(79,70,229,0.1)] hover:shadow-[0_20px_60px_rgba(136,58,255,0.2)] transition-all duration-300 hover:border-indigo-500/40 overflow-hidden"
            >
              <div className="relative rounded-lg sm:rounded-2xl overflow-hidden bg-black border border-slate-800/50 group-hover:border-indigo-500/30 transition-all">
                <Image
                  src={diagram.url}
                  alt={diagram.title}
                  width={800}
                  height={600}
                  className="w-full rounded-lg sm:rounded-xl bg-slate-950 h-48 sm:h-64 md:h-80 object-contain group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
              </div>
              <div className="space-y-1 sm:space-y-2">
                <h3 className="text-base sm:text-lg font-bold text-white group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-indigo-300 group-hover:to-fuchsia-300 transition-all">{diagram.title}</h3>
                <p className="text-xs sm:text-sm text-slate-400 group-hover:text-slate-300 transition-colors leading-relaxed">{diagram.description}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Vision Section */}
      <section className="rounded-2xl sm:rounded-3xl border border-indigo-500/30 bg-gradient-to-br from-indigo-950/40 to-fuchsia-950/30 backdrop-blur-md p-6 sm:p-10 space-y-4 sm:space-y-6 shadow-[0_10px_40px_rgba(79,70,229,0.15)] sm:shadow-[0_15px_60px_rgba(79,70,229,0.2)]">
        <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-indigo-300 to-fuchsia-300">{t.inspirationHeading}</h2>
        <p className="text-sm sm:text-base md:text-lg text-slate-200 leading-relaxed">{t.inspirationBody}</p>
      </section>

      {/* Gallery Section */}
      <section className="space-y-6 sm:space-y-8">
        <div className="space-y-2">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white">{t.galleryHeading}</h2>
          <div className="h-1 w-12 bg-gradient-to-r from-indigo-500 to-fuchsia-500 rounded-full"></div>
        </div>
        <div className="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2 md:grid-cols-3">
          {galleryImages.map((item, idx) => (
            <figure
              key={item.caption}
              className="group rounded-xl sm:rounded-2xl overflow-hidden border border-indigo-500/20 bg-slate-950/60 shadow-[0_10px_40px_rgba(79,70,229,0.1)] hover:shadow-[0_20px_60px_rgba(136,58,255,0.2)] transition-all duration-300 hover:border-indigo-500/40 cursor-pointer"
            >
              <div className="relative overflow-hidden bg-slate-900/80 h-40 sm:h-48 md:h-56">
                <Image
                  src={item.src}
                  alt={item.caption}
                  width={800}
                  height={400}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
              </div>
              <figcaption className="p-3 sm:p-4 text-xs sm:text-sm font-medium text-slate-300 bg-gradient-to-r from-slate-900/80 to-slate-950/80 group-hover:text-white transition-colors">
                <span className="text-indigo-400 font-bold mr-1.5 sm:mr-2">0{idx + 1}.</span>
                {item.caption}
              </figcaption>
            </figure>
          ))}
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="rounded-2xl sm:rounded-3xl border border-fuchsia-500/40 bg-gradient-to-br from-fuchsia-950/50 to-indigo-950/40 backdrop-blur-md p-6 sm:p-12 text-center space-y-4 sm:space-y-6 shadow-[0_10px_40px_rgba(217,70,239,0.15)] sm:shadow-[0_20px_80px_rgba(217,70,239,0.2)]">
        <h3 className="text-2xl sm:text-3xl md:text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-fuchsia-300 via-rose-300 to-indigo-300">{t.ctaTitle}</h3>
        <p className="text-sm sm:text-base md:text-lg text-slate-200 max-w-2xl mx-auto">{t.ctaSubtitle}</p>
        <Link
          href="/goals"
          className="inline-block btn btn-sm sm:btn-md px-6 sm:px-10 py-2 sm:py-3 font-bold bg-gradient-to-r from-fuchsia-500 to-rose-500 text-white border-0 shadow-[0_4px_12px_rgba(217,70,239,0.2)] sm:shadow-[0_8px_24px_rgba(217,70,239,0.3)] hover:shadow-[0_6px_16px_rgba(217,70,239,0.25)] sm:hover:shadow-[0_12px_32px_rgba(217,70,239,0.4)] hover:from-fuchsia-400 hover:to-rose-400 transition-all duration-200 transform hover:scale-105 active:scale-95 text-xs sm:text-base"
        >
          {t.ctaButton}
        </Link>
      </section>
    </div>
  );
};