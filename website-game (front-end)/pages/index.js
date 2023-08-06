import Head from "next/head";
import styles from "../styles/Home.module.css";
import { useState } from "react";

import { ConnectButton } from "@web3uikit/web3";

import ChangeStatsSection from "../components/ChangeStatsSection";
import AuthWalletButton from "../components/AuthWalletButton";
import BattleRadarSection from "../components/BattleRadarSection";
import FightSection from "../components/FightSection";

export default function Home() {
  const [showFightPage, setShowFightPage] = useState(false);

  const [fightData, setFightData] = useState({
    fightId: "0x0000000000000dEfAuLt",
    p1: "0x00plaYer1Address",
    p2: "0x00plaYer2Address",
    nft1: 0,
    nft2: 0,
    bet1: 0,
    bet2: 0,
  });

  return (
    <div className={styles.container}>
      <Head>
        <title>BuddyFighters</title>
        <meta name="description" content="PATATAS XD" />
        <link rel="icon" href="/pokeball.ico" />
      </Head>
      <header>BUDDY FIGHTERS!!! SO LEGENDARY, SO FIGHTERS</header>

      <main>
        {showFightPage ? (
          <FightSection fightData={fightData} setShowFightPage={setShowFightPage}/>
        ) : (
          <>
            <ConnectButton />
            <ChangeStatsSection />
            <AuthWalletButton />
            <BattleRadarSection
              setShowFightPage={setShowFightPage}
              setFightData={setFightData}
            />
          </>
        )}
      </main>
      <footer>Developed by: Carlos Alegre Urquizú</footer>
    </div>
  );
}
