import Head from "next/head"
import Image from "next/image"
import styles from "../styles/Home.module.css"

import { useState } from "react"

import { ConnectWallet } from "@web3uikit/web3"
import UseNftSection from "../components/UseNftSection"
import MainPageMessage from "../components/MainPageMessage"
import NftsDisplay from "../components/NftsDisplay"

export default function Home() {
    const [connected, setConnected] = useState(false)
    return (
        <div className={styles.container}>
            <Head>
                <title>BuddyFighters</title>
                <meta name="description" content="PATATAS XD" />
                <link rel="icon" href="/pokeball.ico" />
            </Head>
            <header> BUDDY FIGHTERS!!! SO LEGENDARY, SO FIGHTERS </header>

            <main>
                <section>
                    <ConnectWallet moralisAuth={false} />
                </section>
                <section>
                    {connected ? <UseNftSection /> : <MainPageMessage />}
                </section>
                <section>
                    <NftsDisplay />
                </section>
            </main>
            <button onClick={()=>{setConnected(!connected)}}> change display </button>
            <footer>Developed by: Carlos Alegre Urquizú</footer>
        </div>
    )
}
