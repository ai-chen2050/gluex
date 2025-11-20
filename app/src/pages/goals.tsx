import type { NextPage } from "next";
import Head from "next/head";
import { GoalsView } from "../views";

const GoalsPage: NextPage = () => (
  <>
    <Head>
      <title>GlueX | Goals</title>
      <meta name="description" content="Coordinate, verify and reward GlueX goals." />
    </Head>
    <GoalsView />
  </>
);

export default GoalsPage;

