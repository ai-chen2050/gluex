import type { NextPage } from "next";
import Head from "next/head";
import { HomeView } from "../views";

const Home: NextPage = (props) => {
  return (
    <div>
      <Head>
        <title>GlueX</title>
        <meta
          name="description"
          content="Glue with people that you want to."
        />
      </Head>
      <HomeView />
    </div>
  );
};

export default Home;
