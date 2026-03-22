// Next, React
import { FC, useEffect, useRef, useState } from 'react';
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
      'Behavioral incentive rails for every relationship.\nDesign 21-day habits, staged targets, surprise transfers, and global Agent bounties with automatic verification on Solana.',
    heroCta: 'Launch a mission',
    heroSecondary: 'Understand the design memo',
    highlightHeading: 'Why communities choose GlueX',
    highlights: [
      {
        title: 'Multi-role trust rooms',
        description: 'Capture parent–child, partners, DAO squads or workplace rituals inside one programmable space.',
      },
      {
        title: 'Agent Guild & Bounties',
        description: 'Sponsor open missions, claim global bounties, and build decentralized reputation on the Social Graph network.',
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
    heroSubtitle: '21 天习惯、阶段性目标、惊喜时刻与全球 Agent 悬赏都能自动验证、自动结算，保障多方协作结果。',
    heroCta: '立即创建激励计划',
    heroSecondary: '查看设计思路',
    highlightHeading: '为什么选择 GlueX',
    highlights: [
      {
        title: '多角色信任空间',
        description: '亲子、情侣、团队或 DAO 小组都能在同一个自动化空间内定义目标与激励。',
      },
      {
        title: 'Agent 悬赏与社交图谱',
        description: '面向全网发布公开悬赏，参与认领并完成任务，在互动图谱中建立并展示你的链上声誉。',
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
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isVideoLoaded, setIsVideoLoaded] = useState(false);
  const [isIntersecting, setIsIntersecting] = useState(false);
  const heroRef = useRef<HTMLDivElement>(null);

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

  // Intersection Observer for fade-in animations
  useEffect(() => {
    const heroObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsIntersecting(true);
          }
        });
      },
      { threshold: 0.1 }
    );

    if (heroRef.current) {
      heroObserver.observe(heroRef.current);
    }

    // Observer for scroll-fade-in sections - delay to ensure DOM is ready
    let scrollObserver: IntersectionObserver | null = null;
    let scrollElements: NodeListOf<Element> | null = null;

    const timeoutId = setTimeout(() => {
      scrollObserver = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              entry.target.classList.add('visible');
            }
          });
        },
        { threshold: 0.1, rootMargin: '0px 0px -50px 0px' }
      );

      scrollElements = document.querySelectorAll('.scroll-fade-in');
      scrollElements.forEach((el) => scrollObserver?.observe(el));
    }, 100);

    return () => {
      clearTimeout(timeoutId);
      if (heroRef.current) {
        heroObserver.unobserve(heroRef.current);
      }
      if (scrollObserver && scrollElements) {
        scrollElements.forEach((el) => scrollObserver?.unobserve(el));
      }
    };
  }, []);

  // Handle video load and autoplay
  useEffect(() => {
    const video = videoRef.current;
    if (video) {
      const handleLoadedData = () => {
        setIsVideoLoaded(true);
        video.play().catch((error) => {
          console.log('Video autoplay prevented:', error);
        });
      };
      video.addEventListener('loadeddata', handleLoadedData);
      return () => {
        video.removeEventListener('loadeddata', handleLoadedData);
      };
    }
  }, []);

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
      <section className="flex flex-col gap-4 sm:gap-6" ref={heroRef}>
        <div className="relative rounded-2xl sm:rounded-3xl border border-indigo-500/30 bg-gradient-to-br from-slate-950/80 to-slate-900/80 backdrop-blur-md p-5 sm:p-10 text-center space-y-3 sm:space-y-5 shadow-[0_15px_50px_rgba(79,70,229,0.25)] sm:shadow-[0_25px_100px_rgba(79,70,229,0.35)]">
          {/* Top-Right Social Icons */}
          <div className="absolute top-4 right-4 sm:top-6 sm:right-6 flex gap-2 sm:gap-3 z-20">
            <a 
              href="https://x.com/Mr_chen5694" 
              target="_blank" 
              rel="noreferrer noopener" 
              className="w-8 h-8 sm:w-12 sm:h-12 rounded-full border border-slate-600/50 bg-slate-900/60 text-slate-200 hover:bg-black hover:text-white hover:border-slate-400 transition-all duration-200 transform hover:scale-110 tooltip tooltip-bottom flex items-center justify-center"
              data-tip={language === 'en' ? 'Follow on X' : '关注推特'}
            >
              <svg className="w-4 h-4 sm:w-5 sm:h-5" viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.005 4.15H5.059z"/></svg>
            </a>
            <a 
              href="https://t.me/+-RAX2V50bKw4ZjZl" 
              target="_blank" 
              rel="noreferrer noopener" 
              className="w-8 h-8 sm:w-12 sm:h-12 rounded-full border border-slate-600/50 bg-slate-900/60 text-sky-400 hover:bg-sky-500 hover:text-white hover:border-sky-500 transition-all duration-200 transform hover:scale-110 tooltip tooltip-bottom flex items-center justify-center"
              data-tip={language === 'en' ? 'Join Telegram' : '加入电报群'}
            >
              <svg className="w-4 h-4 sm:w-5 sm:h-5" viewBox="0 0 24 24" fill="currentColor"><path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a5.96 5.96 0 0 0-.056 0zm4.962 7.224-2.124 10.005c-.161.737-.597.918-1.21.571l-3.34-2.463-1.613 1.554a.855.855 0 0 1-.68.334l.24-3.411 6.205-5.602c.27-.24-.059-.373-.418-.135L6.29 12.89 3.003 11.86c-.71-.223-.728-.71.149-1.054l12.783-4.925c.594-.22.112.98.971s.755z"/></svg>
            </a>
          </div>

          {/* Content Layer */}
          <div className={`w-full space-y-3 sm:space-y-5 transition-all duration-1000 pt-8 sm:pt-0 ${
            isIntersecting ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`}>
          <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3 text-xs sm:text-sm uppercase tracking-[0.2em] sm:tracking-[0.3em] text-indigo-300 font-semibold animate-fade-in">
            <span className="inline-flex items-center gap-1.5 sm:gap-2 rounded-full border border-indigo-500/50 bg-indigo-500/15 px-3 sm:px-4 py-1 sm:py-1.5 text-[11px] sm:text-[12px] font-semibold backdrop-blur-sm hover:bg-indigo-500/25 transition-all hover:scale-105">
              <span className="h-1.5 w-1.5 sm:h-2 sm:w-2 rounded-full bg-fuchsia-400 animate-pulse" />
              {t.heroEyebrow}
            </span>
            <span className="text-slate-400 text-xs sm:text-sm backdrop-blur-sm bg-slate-900/30 px-2 py-1 rounded">v{pkg.version}</span>
          </div>
          <div className="space-y-1.5 sm:space-y-3 animate-slide-up delay-200">
            <h1 className="text-3xl sm:text-4xl md:text-6xl lg:text-6xl font-black tracking-tight leading-tight flex items-center justify-center flex-wrap gap-1">
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-green-500 relative inline-block transition-all duration-500 hover:scale-110 animate-float">
                G
                <span className="absolute top-1/4 left-1/3 w-1.5 h-1.5 bg-green-400 rounded-sm animate-pulse"></span>
              </span>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-purple-500 relative inline-block transition-all duration-500 hover:scale-110 animate-float" style={{ animationDelay: '0.1s' }}>
                l
                <span className="absolute bottom-0 left-0 w-1.5 h-2 bg-blue-400 rounded-sm animate-pulse"></span>
              </span>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-purple-500 relative inline-block transition-all duration-500 hover:scale-110 animate-float" style={{ animationDelay: '0.2s' }}>
                u
              </span>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-red-500 relative inline-block transition-all duration-500 hover:scale-110 animate-float" style={{ animationDelay: '0.3s' }}>
                e
                <span className="absolute bottom-1/4 right-1/3 w-1.5 h-1.5 bg-orange-400 rounded-sm animate-pulse"></span>
              </span>
              <span className="text-white relative inline-block transition-all duration-500 hover:scale-110 animate-float" style={{ animationDelay: '0.4s' }}>X</span>
            </h1>
            <div className="flex items-center justify-center gap-3">
              <h2 className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold text-white whitespace-pre-line leading-snug text-balance drop-shadow-lg">
                {heroBefore}
                {heroMarkerText && (
                  <>
                    {heroMarkerText}
                    <button
                      type="button"
                      title="Rotate Earth"
                      aria-label="rotate-earth"
                      className="inline-block ml-0 sm:ml-1 p-1 rounded-full hover:bg-white/10 transition-all hover:scale-110"
                    >
                      <span
                        className="rotating inline-block text-2xl sm:text-5xl transform transition duration-500 hover:scale-125 drop-shadow-lg"
                        aria-hidden
                      >
                        🌏
                      </span>
                    </button>
                  </>
                )}
                {!heroMarkerText && (
                  <button
                    type="button"
                    title="Rotate Earth"
                    aria-label="rotate-earth"
                    className="inline-block ml-0 sm:ml-1 p-1 rounded-full hover:bg-white/10 transition-all hover:scale-110"
                  >
                    <span
                      className="rotating inline-block text-2xl sm:text-5xl transform transition duration-500 hover:scale-125 drop-shadow-lg"
                      aria-hidden
                    >
                      🌏
                    </span>
                  </button>
                )}
                {heroAfter}
              </h2>
            </div>
          </div>
          
          {/* Video between title and subtitle */}
          <div className="flex justify-center my-4 sm:my-6 animate-fade-in delay-300">
            <div className="relative w-full max-w-2xl rounded-xl sm:rounded-2xl overflow-hidden border border-indigo-500/30 shadow-[0_10px_40px_rgba(79,70,229,0.2)] hover:shadow-[0_15px_60px_rgba(79,70,229,0.3)] transition-all duration-300 hover:scale-[1.02] transform bg-slate-900/30">
              <video
                ref={videoRef}
                autoPlay
                loop
                muted
                playsInline
                className="w-full h-auto"
              >
                <source src="/gluex/hero.mp4" type="video/mp4" />
              </video>
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/20 via-transparent to-transparent pointer-events-none"></div>
            </div>
          </div>
          
          <p className="text-xs sm:text-sm md:text-base lg:text-lg text-slate-200 leading-relaxed max-w-3xl mx-auto whitespace-pre-line text-balance drop-shadow-md animate-fade-in delay-400">
            {t.heroSubtitle}
          </p>
          <div className="flex flex-col sm:flex-row flex-wrap gap-3 sm:gap-4 justify-center pt-2 sm:pt-4 animate-fade-in delay-600">
            <Link
              href="/goals"
              className="btn btn-sm sm:btn-md px-4 sm:px-8 py-2 sm:py-3 font-bold bg-gradient-to-r from-indigo-500 to-blue-500 text-white border-0 shadow-[0_4px_12px_rgba(79,70,229,0.2)] sm:shadow-[0_8px_24px_rgba(79,70,229,0.3)] hover:shadow-[0_8px_20px_rgba(79,70,229,0.3)] sm:hover:shadow-[0_12px_32px_rgba(79,70,229,0.4)] hover:from-indigo-400 hover:to-blue-400 transition-all duration-200 transform hover:scale-105 active:scale-95 text-xs sm:text-base animate-pulse-glow"
            >
              {t.heroCta}
            </Link>
            <Link
              href="/agents"
              className="btn btn-sm sm:btn-md px-4 sm:px-8 py-2 sm:py-3 font-bold bg-gradient-to-r from-fuchsia-500 to-rose-500 text-white border-0 shadow-[0_4px_12px_rgba(217,70,239,0.2)] sm:shadow-[0_8px_24px_rgba(217,70,239,0.3)] hover:shadow-[0_8px_20px_rgba(217,70,239,0.3)] sm:hover:shadow-[0_12px_32px_rgba(217,70,239,0.4)] hover:from-fuchsia-400 hover:to-rose-400 transition-all duration-200 transform hover:scale-105 active:scale-95 text-xs sm:text-base animate-pulse-glow"
            >
              {language === 'en' ? 'Explore Global Bounties' : '探索全网智能体悬赏'}
            </Link>
            <Link
              href="https://github.com/ai-chen2050/gluex"
              target="_blank"
              className="btn btn-sm sm:btn-md px-4 sm:px-8 py-2 sm:py-3 font-semibold text-slate-200 border border-slate-600/50 bg-slate-900/60 hover:bg-slate-800/80 hover:text-white hover:border-indigo-500/50 transition-all duration-200 transform hover:scale-105 active:scale-95 backdrop-blur-sm text-xs sm:text-base"
            >
              {t.heroSecondary}
            </Link>
          </div>
          </div>
        </div>

        {/* Wallet Balance Card */}
        <div className={`rounded-2xl sm:rounded-3xl border border-indigo-500/20 bg-gradient-to-br from-slate-950/60 to-slate-900/60 backdrop-blur-md p-6 sm:p-10 shadow-[0_15px_50px_rgba(79,70,229,0.15)] sm:shadow-[0_20px_70px_rgba(79,70,229,0.2)] space-y-4 sm:space-y-6 max-w-2xl w-full mx-auto scroll-fade-in hover:shadow-[0_25px_80px_rgba(79,70,229,0.3)] transition-all duration-300 hover:border-indigo-500/30 hover:scale-[1.02] transform`}>
          <RequestAirdrop />
          <div className="space-y-1.5 sm:space-y-2">
            <div className="text-3xl sm:text-4xl md:text-5xl font-bold text-center text-transparent bg-clip-text bg-gradient-to-r from-indigo-300 to-fuchsia-300 leading-tight animate-pulse-number">
              {wallet.publicKey ? (balance || 0).toLocaleString() : '—'}
              <span className="text-base text-2xl sm:text-2xl md:text-2xl ml-2">SOL</span>
            </div>
            <div className="text-center text-xs sm:text-sm text-slate-400">SOL Balance</div>
          </div>
          <p className="text-center text-xs sm:text-sm text-slate-500 break-all line-clamp-2">
            {wallet.publicKey ? wallet.publicKey.toBase58() : 'Connect a wallet to preview live balances.'}
          </p>
          <div className="mockup-code bg-slate-900/80 text-left rounded-lg sm:rounded-xl border border-slate-700/50 text-xs sm:text-sm overflow-hidden hover:border-indigo-500/50 transition-all duration-300">
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
      <section className="space-y-6 sm:space-y-8 scroll-fade-in">
        <div className="space-y-2">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white">{t.highlightHeading}</h2>
          <div className="h-1 w-12 bg-gradient-to-r from-indigo-500 to-fuchsia-500 rounded-full animate-slide-right"></div>
        </div>
        <div className="grid gap-4 sm:gap-6 md:grid-cols-2 lg:grid-cols-4">
          {t.highlights.map((card, idx) => (
            <div
              key={card.title}
              className="group relative rounded-xl sm:rounded-2xl border border-indigo-500/20 bg-gradient-to-br from-slate-950/60 to-slate-900/40 backdrop-blur-md p-4 sm:p-6 space-y-2 sm:space-y-4 shadow-[0_10px_40px_rgba(79,70,229,0.1)] hover:shadow-[0_20px_60px_rgba(136,58,255,0.2)] transition-all duration-300 hover:border-indigo-500/40 hover:from-slate-950/80 hover:to-slate-900/60 overflow-hidden hover:scale-105 transform"
              style={{ animationDelay: `${idx * 0.1}s` }}
            >
              <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500/10 to-fuchsia-500/10 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 -z-10"></div>
              <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-gradient-to-br from-indigo-500/20 to-fuchsia-500/20 flex items-center justify-center text-base sm:text-lg font-bold text-indigo-300 group-hover:from-indigo-500/40 group-hover:to-fuchsia-500/40 transition-all duration-300 group-hover:scale-110 flex-shrink-0">
                {idx + 1}
              </div>
              <h3 className="text-base sm:text-lg font-bold text-white group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-indigo-300 group-hover:to-fuchsia-300 transition-all duration-300">{card.title}</h3>
              <p className="text-xs sm:text-sm text-slate-400 group-hover:text-slate-300 transition-colors leading-relaxed">{card.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Diagrams Section */}
      <section className="space-y-6 sm:space-y-8 scroll-fade-in">
        <div className="space-y-2">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white">{t.diagramHeading}</h2>
          <div className="h-1 w-12 bg-gradient-to-r from-indigo-500 to-fuchsia-500 rounded-full animate-slide-right"></div>
        </div>
        <div className="grid gap-4 sm:gap-6 md:grid-cols-2">
          {t.diagrams.map((diagram, idx) => (
            <div
              key={diagram.title}
              className="group rounded-2xl sm:rounded-3xl border border-indigo-500/20 bg-gradient-to-br from-slate-950/60 to-slate-900/40 backdrop-blur-md p-4 sm:p-6 space-y-3 sm:space-y-4 shadow-[0_10px_40px_rgba(79,70,229,0.1)] hover:shadow-[0_20px_60px_rgba(136,58,255,0.2)] transition-all duration-300 hover:border-indigo-500/40 overflow-hidden hover:scale-[1.02] transform"
              style={{ animationDelay: `${idx * 0.15}s` }}
            >
              <div className="relative rounded-lg sm:rounded-2xl overflow-hidden bg-black border border-slate-800/50 group-hover:border-indigo-500/30 transition-all duration-300">
                <Image
                  src={diagram.url}
                  alt={diagram.title}
                  width={800}
                  height={600}
                  className="w-full rounded-lg sm:rounded-xl bg-slate-950 h-48 sm:h-64 md:h-80 object-contain group-hover:scale-110 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              </div>
              <div className="space-y-1 sm:space-y-2">
                <h3 className="text-base sm:text-lg font-bold text-white group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-indigo-300 group-hover:to-fuchsia-300 transition-all duration-300">{diagram.title}</h3>
                <p className="text-xs sm:text-sm text-slate-400 group-hover:text-slate-300 transition-colors duration-300 leading-relaxed">{diagram.description}</p>
              </div>
            </div>
          ))}
        </div>
      </section>


      {/* Vision Section with Video Embedded */}
      <section className="rounded-2xl sm:rounded-3xl border border-indigo-500/30 bg-gradient-to-br from-indigo-950/40 to-fuchsia-950/30 backdrop-blur-md p-6 sm:p-10 space-y-4 sm:space-y-6 shadow-[0_10px_40px_rgba(79,70,229,0.15)] sm:shadow-[0_15px_60px_rgba(79,70,229,0.2)] scroll-fade-in hover:shadow-[0_15px_60px_rgba(79,70,229,0.3)] transition-all duration-300 hover:border-indigo-500/50">
        <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-indigo-300 to-fuchsia-300">{t.inspirationHeading}</h2>
        <p className="text-sm sm:text-base md:text-lg text-slate-200 leading-relaxed">{t.inspirationBody}</p>
        {/* Vision Video Embedded */}
        <div className="relative w-full max-w-4xl mx-auto rounded-2xl sm:rounded-3xl border border-indigo-500/30 overflow-hidden shadow-[0_10px_40px_rgba(79,70,229,0.15)] sm:shadow-[0_20px_70px_rgba(79,70,229,0.2)] group aspect-video bg-slate-950 mt-6">
          <video
            autoPlay
            loop
            muted
            playsInline
            controls
            className="w-full h-full object-cover"
            poster="/gluex/vision-poster.jpg"
          >
            <source src="/gluex/vision.mp4" type="video/mp4" />
            Your browser does not support the video tag.
          </video>
          {/* Optional: Overlay for subtle effect */}
          <div className="absolute inset-0 bg-indigo-900/10 mix-blend-overlay pointer-events-none"></div>
        </div>
      </section>

      {/* Gallery Section */}
      <section className="space-y-6 sm:space-y-8 scroll-fade-in">
        <div className="space-y-2">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white">{t.galleryHeading}</h2>
          <div className="h-1 w-12 bg-gradient-to-r from-indigo-500 to-fuchsia-500 rounded-full animate-slide-right"></div>
        </div>
        <div className="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2 md:grid-cols-3">
          {galleryImages.map((item, idx) => (
            <figure
              key={item.caption}
              className="group rounded-xl sm:rounded-2xl overflow-hidden border border-indigo-500/20 bg-slate-950/60 shadow-[0_10px_40px_rgba(79,70,229,0.1)] hover:shadow-[0_20px_60px_rgba(136,58,255,0.2)] transition-all duration-300 hover:border-indigo-500/40 cursor-pointer hover:scale-105 transform"
              style={{ animationDelay: `${idx * 0.1}s` }}
            >
              <div className="relative overflow-hidden bg-slate-900/80 h-40 sm:h-48 md:h-56">
                <Image
                  src={item.src}
                  alt={item.caption}
                  width={800}
                  height={400}
                  className="w-full h-full object-cover group-hover:scale-125 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              </div>
              <figcaption className="p-3 sm:p-4 text-xs sm:text-sm font-medium text-slate-300 bg-gradient-to-r from-slate-900/80 to-slate-950/80 group-hover:text-white transition-colors duration-300">
                <span className="text-indigo-400 font-bold mr-1.5 sm:mr-2">0{idx + 1}.</span>
                {item.caption}
              </figcaption>
            </figure>
          ))}
        </div>
      </section>

      {/* Community & Mobile Promo Section */}
      <section className="grid md:grid-cols-2 gap-8 lg:gap-12 items-center scroll-fade-in py-4 sm:py-8">
        <div className="flex justify-center md:justify-end">
          <div className="relative w-full max-w-[280px] sm:max-w-[320px] rounded-[2rem] sm:rounded-[2.5rem] overflow-hidden border-4 sm:border-[6px] border-slate-800 shadow-[0_20px_60px_rgba(79,70,229,0.25)] bg-slate-950 transform hover:scale-[1.02] transition-transform duration-500">
            {/* Phone notch simulation */}
            <div className="absolute top-0 inset-x-0 h-6 flex justify-center z-10">
              <div className="w-1/3 h-full bg-slate-800 rounded-b-xl"></div>
            </div>
            <video
              autoPlay
              loop
              muted
              playsInline
              controls
              className="w-full h-auto object-cover aspect-[9/16]"
            >
              <source src="/gluex/gluex-promo-mobile.mp4" type="video/mp4" />
            </video>
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/40 via-transparent to-transparent pointer-events-none"></div>
          </div>
        </div>
        <div className="space-y-6 text-center md:text-left pt-4 md:pt-0">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-sky-400 to-indigo-400 leading-tight">
            {language === 'en' ? 'Join the GlueX Community' : '加入 GlueX 社区'}
          </h2>
          <p className="text-slate-300 text-base sm:text-lg leading-relaxed max-w-lg mx-auto md:mx-0">
            {language === 'en' 
              ? 'Connect with other agents, stay updated with our latest features, and participate in exclusive bounties!'
              : '关注我们的社交媒体，与其他智能体建立连接，获取最新功能动态并参与专属悬赏活动！'}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center md:justify-start pt-2">
            <a 
              href="https://x.com/Mr_chen5694" 
              target="_blank" 
              rel="noreferrer noopener" 
              className="btn btn-outline border-slate-600 text-slate-200 hover:bg-black hover:text-white hover:border-slate-400 flex items-center gap-2 rounded-xl transition-all hover:scale-105"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.005 4.15H5.059z"/></svg>
              Follow on X
            </a>
            <a 
              href="https://t.me/+-RAX2V50bKw4ZjZl" 
              target="_blank" 
              rel="noreferrer noopener" 
              className="btn btn-outline border-sky-500/50 text-sky-400 hover:bg-sky-500 hover:text-white hover:border-sky-500 flex items-center gap-2 rounded-xl transition-all hover:scale-105"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor"><path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a5.96 5.96 0 0 0-.056 0zm4.962 7.224-2.124 10.005c-.161.737-.597.918-1.21.571l-3.34-2.463-1.613 1.554a.855.855 0 0 1-.68.334l.24-3.411 6.205-5.602c.27-.24-.059-.373-.418-.135L6.29 12.89 3.003 11.86c-.71-.223-.728-.71.149-1.054l12.783-4.925c.594-.22.112.98.971s.755z"/></svg>
              Join Telegram
            </a>
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="rounded-2xl sm:rounded-3xl border border-fuchsia-500/40 bg-gradient-to-br from-fuchsia-950/50 to-indigo-950/40 backdrop-blur-md p-6 sm:p-12 text-center space-y-4 sm:space-y-6 shadow-[0_10px_40px_rgba(217,70,239,0.15)] sm:shadow-[0_20px_80px_rgba(217,70,239,0.2)] scroll-fade-in hover:shadow-[0_25px_100px_rgba(217,70,239,0.3)] transition-all duration-300 hover:border-fuchsia-500/60">
        <h3 className="text-2xl sm:text-3xl md:text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-fuchsia-300 via-rose-300 to-indigo-300">{t.ctaTitle}</h3>
        <p className="text-sm sm:text-base md:text-lg text-slate-200 max-w-2xl mx-auto">{t.ctaSubtitle}</p>
        <Link
          href="/goals"
          className="inline-block btn btn-sm sm:btn-md px-6 sm:px-10 py-2 sm:py-3 font-bold bg-gradient-to-r from-fuchsia-500 to-rose-500 text-white border-0 shadow-[0_4px_12px_rgba(217,70,239,0.2)] sm:shadow-[0_8px_24px_rgba(217,70,239,0.3)] hover:shadow-[0_6px_16px_rgba(217,70,239,0.25)] sm:hover:shadow-[0_12px_32px_rgba(217,70,239,0.4)] hover:from-fuchsia-400 hover:to-rose-400 transition-all duration-200 transform hover:scale-110 active:scale-95 text-xs sm:text-base animate-pulse-glow"
        >
          {t.ctaButton}
        </Link>
      </section>
      
      {/* Global animations and styles */}
      <style jsx global>{`
        .scroll-fade-in {
          opacity: 0;
          transform: translateY(30px);
          transition: opacity 0.8s ease-out, transform 0.8s ease-out;
        }
        
        .scroll-fade-in.visible {
          opacity: 1;
          transform: translateY(0);
        }
        
        @keyframes slide-right {
          from {
            width: 0;
            opacity: 0;
          }
          to {
            width: 3rem;
            opacity: 1;
          }
        }
        
        .animate-slide-right {
          animation: slide-right 0.8s ease-out forwards;
        }
        
        .rotating {
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
        
        @keyframes gradient-xy {
          0%, 100% {
            background-position: 0% 50%;
          }
          50% {
            background-position: 100% 50%;
          }
        }
        
        .animate-gradient-xy {
          background-size: 200% 200%;
          animation: gradient-xy 15s ease infinite;
        }
        
        @keyframes fade-in {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }
        
        .animate-fade-in {
          animation: fade-in 1s ease-out forwards;
        }
        
        .delay-200 {
          animation-delay: 0.2s;
          opacity: 0;
        }
        
        .delay-300 {
          animation-delay: 0.3s;
          opacity: 0;
        }
        
        .delay-400 {
          animation-delay: 0.4s;
          opacity: 0;
        }
        
        .delay-600 {
          animation-delay: 0.6s;
          opacity: 0;
        }
        
        @keyframes slide-up {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .animate-slide-up {
          animation: slide-up 0.8s ease-out forwards;
        }
        
        @keyframes float {
          0%, 100% {
            transform: translateY(0px);
          }
          50% {
            transform: translateY(-10px);
          }
        }
        
        .animate-float {
          animation: float 3s ease-in-out infinite;
        }
        
        @keyframes particles {
          0% {
            transform: translateY(0) translateX(0) scale(1);
            opacity: 0;
          }
          10% {
            opacity: 1;
          }
          90% {
            opacity: 1;
          }
          100% {
            transform: translateY(-100vh) translateX(50px) scale(0);
            opacity: 0;
          }
        }
        
        .animate-particles {
          animation: particles linear infinite;
        }
        
        @keyframes pulse-glow {
          0%, 100% {
            box-shadow: 0 4px 12px rgba(136, 58, 255, 0.2), 0 0 20px rgba(136, 58, 255, 0.1);
          }
          50% {
            box-shadow: 0 4px 12px rgba(136, 58, 255, 0.4), 0 0 30px rgba(136, 58, 255, 0.3);
          }
        }
        
        .animate-pulse-glow {
          animation: pulse-glow 2s ease-in-out infinite;
        }
        
        @keyframes pulse-number {
          0%, 100% {
            filter: brightness(1);
          }
          50% {
            filter: brightness(1.2);
          }
        }
        
        .animate-pulse-number {
          animation: pulse-number 2s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
};