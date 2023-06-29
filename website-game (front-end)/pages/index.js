import Head from "next/head";
import styles from "../styles/Home.module.css";

import { ConnectButton } from "@web3uikit/web3";

import ChangeStatsSection from "../components/ChangeStatsSection";
import AuthWalletButton from "../components/AuthWalletButton";
import BattleRadarSection from "../components/BattleRadarSection";

export default function Home() {
  return (
    <div className={styles.container}>
      <Head>
        <title>BuddyFighters</title>
        <meta name="description" content="PATATAS XD" />
        <link rel="icon" href="/pokeball.ico" />
      </Head>
      <header>BUDDY FIGHTERS!!! SO LEGENDARY, SO FIGHTERS</header>

      <main>
        <ConnectButton />
        <ChangeStatsSection />
        <AuthWalletButton />
        <BattleRadarSection />
      </main>
      <footer>Developed by: Carlos Alegre Urquizú</footer>
    </div>
  );
}
