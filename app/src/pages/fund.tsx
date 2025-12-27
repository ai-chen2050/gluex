import type { NextPage } from "next";
import Head from "next/head";
import { FundraiseView } from "../views";

const Fund: NextPage = () => (
  <>
    <Head>
      <title>GlueX | Fund</title>
      <meta name="description" content="Support GlueX development with on-chain donations." />
    </Head>
    <FundraiseView />
  </>
);

export default Fund;
