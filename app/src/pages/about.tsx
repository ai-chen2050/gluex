import type { NextPage } from 'next';
import Head from 'next/head';
import { AboutView } from '../views';

const About: NextPage = () => {
  return (
    <div>
      <Head>
        <title>About GlueX</title>
        <meta name="description" content="Meet the maintainer team and learn how GlueX incentivises contributors." />
      </Head>
      <AboutView />
    </div>
  );
};

export default About;

