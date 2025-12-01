import type { NextPage } from 'next';
import Head from 'next/head';
import { LeadersView } from '../views/leaders';

const Leaderboard: NextPage = () => {
  return (
    <div>
      <Head>
        <title>GlueX — Leaderboard</title>
        <meta name="description" content="GlueX leaderboard and global stats" />
      </Head>
      <LeadersView />
    </div>
  );
};

export default Leaderboard;
