import Head from "next/head"
import Image from "next/image"
import styles from "../styles/Home.module.css"

import { ConnectWallet } from "@web3uikit/web3"
import MintNFTButton from "../components/MintNFTButton"
import FightButton from "../components/FightButton"

export default function Home() {
    return (
        <div className={styles.container}>
            <Head>
                <title>BuddyFighters</title>
                <meta name="description" content="PATATAS XD" />
                <link rel="icon" href="/favicon.ico" />
            </Head>
            BUDDY FIGHTERS!!! SO LEGENDARY, SO FIGHTERS
            <br /> <br /> <br />
            <ConnectWallet moralisAuth={false} />
            <br /> <br />
            <MintNFTButton />
            <br /> <br />
            <FightButton />
        </div>
    )
}
