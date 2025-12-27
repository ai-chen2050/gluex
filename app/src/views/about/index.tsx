import Link from 'next/link';
import { FC } from 'react';
import { useLanguage } from '../../contexts/LanguageProvider';
import FeePoolPanel from '../../components/FeePoolPanel';

const githubAvatar = 'https://avatars.githubusercontent.com/ai-chen2050';
const githubProfile = 'https://ai-chen2050.github.io/';

const content = {
  en: {
    heroTitle: 'GlueX creators & incentive rules',
    heroSubtitle:
      'GlueX is maintained as an open-source, on-chain coordination rail. Meet the founder and see how value flows back to everyone who builds with us.',
    founderBio:
      "Blake Chan · I am a software engineer, innovator, doer, and Mr. Curious. I’ve been digging into web3 for many years and believe in the equal, transparent and decentralized nature of the industry. I’m committed to advancing web3 around the world.",
    founderTagline: 'Founder & Maintainer',
    showcaseHeading: 'Maintainer wall',
    incentiveHeading: 'Progressive fee sharing',
    incentiveIntro:
      'Every transaction routed through GlueX charges a protocol fee. Until a second maintainer ships value, the founder receives 100%. As the team grows, the split automatically rebalances to keep contributors motivated.',
    incentiveSteps: [
      { title: 'Solo builder', share: 'Founder receives 100% of protocol fees.' },
      {
        title: 'Two builders',
        share: 'Fees are split 50% to the founder and 50% to the first co-maintainer.',
      },
      {
        title: 'Three builders',
        share: 'Founder keeps 50%; contributors two and three receive 25% each.',
      },
      {
        title: 'More builders',
        share:
          'New maintainers receive a pro-rata share from the contributor pool while the founder remains at 50%.',
      },
    ],
    contributionHeading: 'How to contribute',
    contributions: [
      {
        title: 'Ship product rituals',
        description:
          'Design new goal templates, automation flows, or proof modules that make GlueX more sticky for squads.',
      },
      {
        title: 'Improve developer tooling',
        description:
          'Help us enhance the Anchor program, write SDK helpers, or harden CI pipelines for safer deployments.',
      },
      {
        title: 'Document and mentor',
        description:
          'Author playbooks, translate docs, or host workshops so the next contributor can start fast.',
      },
    ],
    ctaTitle: 'Ready to build your own incentive rail?',
    ctaSubtitle:
      'Check the docs, pick an issue, and get your first contribution merged to unlock fee sharing.',
    ctaButton: 'Open contributor docs',
  },
  zh: {
    heroTitle: 'GlueX 创作者与激励规则',
    heroSubtitle:
      'GlueX 作为一个开源的链上协作协议运行。这里展示创始人以及贡献者的收益分配方式，欢迎与你一起共建。',
    founderBio:
      'Blake Chan · 我是一名软件工程师、创新者、实干家，同时也是一个保持好奇心的人。我在 Web3 行业深耕多年，热爱这个平等、透明且去中心化的世界，并致力于推动 Web3 在全球的发展。',
    founderTagline: '创始人 / 维护者',
    showcaseHeading: '维护者头像墙',
    incentiveHeading: '逐层递进的手续费分配',
    incentiveIntro:
      'GlueX 中的每一笔链上交易都会产生协议手续费。在只有创始人贡献时，全部手续费归创始人所有；当有更多人参与共建时，分成自动重新分配，以激励贡献者持续投入。',
    incentiveSteps: [
      { title: '单人阶段', share: '创始人获得 100% 的协议手续费。' },
      {
        title: '两人阶段',
        share: '手续费 50% 给创始人，50% 给第一位共同维护者。',
      },
      {
        title: '三人阶段',
        share: '创始人保留 50%，第二位、第三位贡献者各获得 25%。',
      },
      {
        title: '更多贡献者',
        share: '创始人固定 50%，其余 50% 按贡献度在新增维护者之间分配。',
      },
    ],
    contributionHeading: '可以如何贡献',
    contributions: [
      {
        title: '打磨产品体验',
        description: '设计新的目标模板、自动化流程或证明模块，让 GlueX 更适合不同场景。',
      },
      {
        title: '强化开发工具链',
        description: '改进 Anchor 合约、编写 SDK 辅助工具，或完善 CI 流程，让交付更安全。',
      },
      {
        title: '沉淀知识与社群',
        description: '编写指南、翻译文档或组织分享，让下一位贡献者可以更快上手。',
      },
    ],
    ctaTitle: '现在就加入共建吧',
    ctaSubtitle: '查看文档、挑一个 issue，完成你的首次贡献即可参与手续费分配。',
    ctaButton: '查看贡献文档',
  },
};

export const AboutView: FC = () => {
  const { language } = useLanguage();
  const t = content[language];

  return (
    <div className="mx-auto max-w-6xl px-4 py-12 space-y-12">
      <section className="rounded-3xl border border-indigo-500/30 bg-gradient-to-br from-indigo-900/40 to-fuchsia-900/20 p-10 space-y-4">
        {/* <p className="text-sm uppercase tracking-widest text-indigo-300">About GlueX</p> */}
        <p className="text-sm uppercase tracking-widest text-indigo-300 flex items-center">
          About 
          <span className="inline-flex items-center gap-1 ml-2 text-base">
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-green-500 relative inline-block transition-all duration-500 hover:scale-110">
              G
            </span>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-purple-500 relative inline-block transition-all duration-500 hover:scale-110 delay-100">
              l
            </span>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-purple-500 transition-all duration-500 hover:scale-110 delay-200">
              u
            </span>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-red-500 relative inline-block transition-all duration-500 hover:scale-110 delay-300">
              e
            </span>
            <span className="text-white transition-all duration-500 hover:scale-110 delay-400">
              X
            </span>
          </span>
        </p>
        <h1 className="text-4xl md:text-5xl font-bold text-white">{t.heroTitle}</h1>
        <p className="text-lg text-slate-300 max-w-3xl leading-relaxed">{t.heroSubtitle}</p>
      </section>

      <section className="space-y-6 sm:space-y-8">
        <div className="space-y-2 sm:space-y-3">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white">{t.showcaseHeading}</h2>
          <div className="h-1 w-12 bg-gradient-to-r from-indigo-500 to-fuchsia-500 rounded-full"></div>
          <p className="text-xs sm:text-sm text-slate-400 mt-3">
            {language === 'en'
              ? 'Avatar wall pulls directly from GitHub profiles. Click to view public work.'
              : '头像墙直接使用 GitHub 数据，点击即可查看贡献与主页。'}
          </p>
        </div>
        <div className="flex flex-wrap justify-center gap-8 sm:gap-12">
          <Link
            href={githubProfile}
            target="_blank"
            rel="noopener noreferrer"
            className="group relative flex flex-col items-center text-center transition-all duration-300"
          >
            <div className="relative">
              <img
                src={githubAvatar}
                alt="Blake Chan"
                className="h-24 sm:h-32 w-24 sm:w-32 rounded-full border-4 border-indigo-500/60 shadow-[0_8px_24px_rgba(99,102,241,0.3)] group-hover:shadow-[0_12px_32px_rgba(136,58,255,0.4)] transition-all duration-300 group-hover:scale-110"
              />
              <div className="absolute inset-0 rounded-full bg-gradient-to-br from-indigo-500/20 to-fuchsia-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            </div>
            <span className="mt-4 sm:mt-5 text-base sm:text-lg font-bold text-white group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-indigo-300 group-hover:to-fuchsia-300 transition-all duration-300">Blake Chan</span>
            <span className="text-xs uppercase tracking-widest text-indigo-300 mt-1 sm:mt-2 text-[10px] sm:text-xs font-semibold">
              {t.founderTagline}
            </span>
          </Link>
        </div>
      </section>

      <section className="space-y-6 sm:space-y-8">
        <div className="space-y-2">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white flex items-center gap-3">
            {t.incentiveHeading}
            <span title={language === 'en' ? 'Protocol fee pool distribution' : '协议手续费池分配'} className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-gradient-to-r from-indigo-600 to-fuchsia-600 text-white">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M12 2v10l4 2" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M21 12a9 9 0 1 1-9-9" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </span>
          </h2>
          <div className="h-1 w-12 bg-gradient-to-r from-indigo-500 to-fuchsia-500 rounded-full"></div>
        </div>
        <div className="grid gap-4 sm:gap-6 md:grid-cols-2">
          <div className="rounded-2xl sm:rounded-3xl border border-indigo-500/20 bg-gradient-to-br from-slate-950/60 to-slate-900/40 backdrop-blur-md p-5 sm:p-6 space-y-4 sm:space-y-5 shadow-[0_10px_40px_rgba(79,70,229,0.1)] hover:shadow-[0_20px_60px_rgba(136,58,255,0.2)] transition-all duration-300 hover:border-indigo-500/40 hover:from-slate-950/80 hover:to-slate-900/60">
            <p className="text-sm text-slate-300">{t.incentiveIntro}</p>
            <div className="space-y-2 sm:space-y-3">
              {t.incentiveSteps.map((step) => (
                <div
                  key={step.title}
                  className="group rounded-xl sm:rounded-2xl border border-indigo-500/20 bg-gradient-to-r from-indigo-500/10 to-fuchsia-500/5 p-3 sm:p-4 hover:border-indigo-500/40 hover:from-indigo-500/20 hover:to-fuchsia-500/10 transition-all duration-300"
                >
                  <p className="text-xs sm:text-sm font-bold text-indigo-300 uppercase tracking-wide group-hover:text-indigo-200 transition-colors">
                    {step.title}
                  </p>
                  <p className="text-xs sm:text-sm text-slate-300 mt-1 group-hover:text-slate-200 transition-colors">{step.share}</p>
                </div>
              ))}
            </div>
          </div>
          <div className="rounded-2xl sm:rounded-3xl border border-indigo-500/20 bg-gradient-to-br from-slate-950/60 to-slate-900/40 backdrop-blur-md p-5 sm:p-6 space-y-4 sm:space-y-5 shadow-[0_10px_40px_rgba(79,70,229,0.1)] hover:shadow-[0_20px_60px_rgba(136,58,255,0.2)] transition-all duration-300 hover:border-indigo-500/40 hover:from-slate-950/80 hover:to-slate-900/60">
            <h3 className="text-lg sm:text-xl font-bold text-white">{t.contributionHeading}</h3>
            <div className="space-y-3 sm:space-y-4">
              {t.contributions.map((item) => (
                <div key={item.title} className="group rounded-xl sm:rounded-2xl border border-indigo-500/20 bg-gradient-to-r from-indigo-500/10 to-fuchsia-500/5 p-3 sm:p-4 hover:border-indigo-500/40 hover:from-indigo-500/20 hover:to-fuchsia-500/10 transition-all duration-300">
                  <p className="font-semibold text-white text-sm sm:text-base group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-indigo-300 group-hover:to-fuchsia-300 transition-all">{item.title}</p>
                  <p className="text-xs sm:text-sm text-slate-400 mt-1.5 group-hover:text-slate-300 transition-colors">{item.description}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
        <div className="mt-6">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white">
            {language === 'en' ? 'Fee Pool' : '手续费池'}
          </h2>
          <div className="h-1 w-12 bg-gradient-to-r from-indigo-500 to-fuchsia-500 rounded-full mt-3"></div>
          <div className="mt-4">
            <FeePoolPanel showExternal={false} />
          </div>
        </div>
      </section>

      <section className="rounded-2xl sm:rounded-3xl border border-fuchsia-500/40 bg-gradient-to-br from-fuchsia-950/50 to-indigo-950/40 backdrop-blur-md p-6 sm:p-12 text-center space-y-4 sm:space-y-6 shadow-[0_10px_40px_rgba(217,70,239,0.15)] sm:shadow-[0_20px_80px_rgba(217,70,239,0.2)]">
        <h3 className="text-2xl sm:text-3xl md:text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-fuchsia-300 via-rose-300 to-indigo-300">{t.ctaTitle}</h3>
        <p className="text-sm sm:text-base md:text-lg text-slate-200 max-w-2xl mx-auto">{t.ctaSubtitle}</p>
        <Link href="https://github.com/ai-chen2050/gluex/issues" target="_blank" className="inline-block btn btn-sm sm:btn-md px-6 sm:px-10 py-2 sm:py-3 font-bold bg-gradient-to-r from-fuchsia-500 to-rose-500 text-white border-0 shadow-[0_4px_12px_rgba(217,70,239,0.2)] sm:shadow-[0_8px_24px_rgba(217,70,239,0.3)] hover:shadow-[0_6px_16px_rgba(217,70,239,0.25)] sm:hover:shadow-[0_12px_32px_rgba(217,70,239,0.4)] hover:from-fuchsia-400 hover:to-rose-400 transition-all duration-200 transform hover:scale-105 active:scale-95 text-xs sm:text-base">
          {t.ctaButton}
        </Link>
      </section>
    </div>
  );
};

