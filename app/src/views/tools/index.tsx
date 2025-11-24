import { FC } from "react";
import { SignMessage } from '../../components/SignMessage';
import { SendTransaction } from '../../components/SendTransaction';
import { SendVersionedTransaction } from '../../components/SendVersionedTransaction';
import { useLanguage } from '../../contexts/LanguageProvider';

const copy = {
  en: {
    title: 'Tools',
    description:
      'A handy toolbox for experimenting with message signing and Solana transaction flows. Validate wallet connectivity before launching incentive missions.',
    quickActions: 'Quick actions',
    playgroundTitle: 'Wallet playground',
    playgroundCopy:
      'Use these widgets to sign raw messages, send legacy or versioned transactions, and rehearse proof submissions.',
    recipesTitle: 'Blueprints & recipes',
    recipeCards: [
      {
        title: 'Habit checkpoint rehearsal',
        desc: 'Simulate 21-day habit submissions by signing a note and sending a mock transaction hash.',
      },
      {
        title: 'Target milestone payout',
        desc: 'Dry-run the SOL transfer for a staged milestone before you automate it on-chain.',
      },
      {
        title: 'Surprise drop trigger',
        desc: 'Ensure your vault has enough lamports and that your wallet can fire the final release call.',
      },
    ],
    guideTitle: '3-minute confidence checklist',
    steps: [
      'Connect burner wallet or Phantom/Backpack.',
      'Request devnet SOL and ensure ≥ 0.5 SOL balance.',
      'Sign a message to verify the address matches your agreement.',
      'Send a small legacy or versioned transaction to test RPC compatibility.',
      'Copy the resulting signature as proof inside your GlueX goal.',
    ],
  },
  zh: {
    title: '工具箱',
    description:
      '用于测试消息签名与多种 Solana 交易流程的实用工具。先在此验证钱包连通性，再上线你的激励旅程。',
    quickActions: '快捷操作',
    playgroundTitle: '钱包操练场',
    playgroundCopy:
      '通过这些组件完成消息签名、传统交易与版本化交易演练，为提交证明或触发激励做彩排。',
    recipesTitle: '操作蓝图',
    recipeCards: [
      {
        title: '习惯打卡演练',
        desc: '先签一条说明、再发送一笔小额交易，模拟 21 天习惯的完成证明。',
      },
      {
        title: '阶段目标发放',
        desc: '上线前先用测试资金跑一遍 SOL 转账流程，确认节点网络无误。',
      },
      {
        title: '惊喜发放触发',
        desc: '检查金库余额与钱包权限，确保可以顺利触发最终的解锁指令。',
      },
    ],
    guideTitle: '3 分钟信心清单',
    steps: [
      '连接测试钱包或主力钱包（Phantom / Backpack）。',
      '申请一笔 devnet SOL，余额保持在 0.5 SOL 以上。',
      '签名一条提示消息，确认对方能验证你的地址。',
      '发送一笔传统或版本化交易，检查 RPC 连接与限速。',
      '复制交易哈希，作为 GlueX 目标中的证明材料。',
    ],
  },
};

export const ToolsView: FC = () => {
  const { language } = useLanguage();
  const t = copy[language];

  return (
    <div className="mx-auto max-w-6xl px-3 sm:px-4 py-8 sm:py-12 space-y-12 sm:space-y-16">
      <section className="rounded-2xl sm:rounded-3xl border border-indigo-500/30 bg-gradient-to-br from-slate-950/80 to-slate-900/80 backdrop-blur-md p-5 sm:p-10 text-center space-y-4 sm:space-y-6 shadow-[0_15px_50px_rgba(79,70,229,0.25)]">
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 to-fuchsia-500">
          {t.title}
        </h1>
        <p className="text-sm sm:text-base md:text-lg text-slate-200 max-w-3xl mx-auto">{t.description}</p>
      </section>

      <section className="grid md:grid-cols-2 gap-6 items-start">
        <div className="rounded-2xl sm:rounded-3xl border border-indigo-500/20 bg-gradient-to-br from-slate-950/60 to-slate-900/40 backdrop-blur-md p-5 sm:p-6 space-y-4 shadow-[0_10px_40px_rgba(79,70,229,0.1)]">
          <p className="text-sm uppercase tracking-wide text-indigo-300 font-semibold">{t.quickActions}</p>
          <div className="space-y-4">
            <div className="rounded-xl sm:rounded-2xl border border-indigo-500/10 bg-slate-900/40 p-4">
              <SignMessage />
            </div>
            <div className="rounded-xl sm:rounded-2xl border border-indigo-500/10 bg-slate-900/40 p-4">
              <SendTransaction />
            </div>
            <div className="rounded-xl sm:rounded-2xl border border-indigo-500/10 bg-slate-900/40 p-4">
              <SendVersionedTransaction />
            </div>
          </div>
        </div>

        <div className="rounded-2xl sm:rounded-3xl border border-indigo-500/20 bg-gradient-to-br from-slate-950/60 to-slate-900/40 backdrop-blur-md p-5 sm:p-6 space-y-4 shadow-[0_10px_40px_rgba(79,70,229,0.12)]">
          <h2 className="text-2xl sm:text-3xl font-semibold text-white">{t.playgroundTitle}</h2>
          <p className="text-slate-300">{t.playgroundCopy}</p>
          <div className="grid gap-4">
            {t.recipeCards.map((card) => (
              <div key={card.title} className="rounded-2xl border border-indigo-500/10 bg-slate-900/40 p-4">
                <h3 className="text-lg font-semibold text-white">{card.title}</h3>
                <p className="text-sm text-slate-400">{card.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="rounded-2xl sm:rounded-3xl border border-indigo-500/20 bg-gradient-to-br from-slate-950/70 to-slate-900/50 backdrop-blur-md p-5 sm:p-6 space-y-4 shadow-[0_10px_40px_rgba(79,70,229,0.12)]">
        <h2 className="text-2xl sm:text-3xl font-semibold text-white">{t.guideTitle}</h2>
        <ol className="list-decimal list-inside space-y-2 text-slate-300">
          {t.steps.map((step, idx) => (
            <li key={idx}>{step}</li>
          ))}
        </ol>
      </section>
    </div>
  );
};

