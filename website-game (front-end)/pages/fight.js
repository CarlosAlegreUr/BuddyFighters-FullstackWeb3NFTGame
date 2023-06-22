import Head from "next/head";
import styles from "../styles/Home.module.css";

import GoToButton from "../components/GoToButton";

export default function Home() {
  return (
    <>
      <Head>
        <title>BuddyFighters: Fight!</title>
        <meta
          name="Fighting NFT page."
          content="You are fighting against someone's nft."
        />
        <link rel="icon" href="/pokeball.ico" />
      </Head>

      <main>
        <h1> FIGHT !</h1>
      </main>

      <footer className="back-to-home-footer">
        <GoToButton text="Back to home page" href="/" />
      </footer>
    </>
  );
}
