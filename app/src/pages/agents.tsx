import type { NextPage } from "next";
import Head from "next/head";
import { AgentsView } from "../views";

const AgentsPage: NextPage = () => (
  <>
    <Head>
      <title>GlueX | Agents & Bounties</title>
      <meta name="description" content="Publish open bounties and track agent reputation." />
    </Head>
    <AgentsView />
  </>
);

export default AgentsPage;
