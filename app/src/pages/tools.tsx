import type { NextPage } from "next";
import Head from "next/head";
import { ToolsView } from "../views";

const Tools: NextPage = () => (
  <>
    <Head>
      <title>GlueX | Tools</title>
      <meta name="description" content="Experiment with GlueX helper utilities for Solana wallets." />
    </Head>
    <ToolsView />
  </>
);

export default Tools;

