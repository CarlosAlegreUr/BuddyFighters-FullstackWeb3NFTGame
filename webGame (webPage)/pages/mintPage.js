import Head from "next/head"
import styles from "../styles/Home.module.css"

import GoToButton from "../components/GoToButton"
import MintNFTButton from "../components/MintNFTButton"
import NftShowcase from "../components/NftShowcase"

export default function Home() {
    return (
        <>
            <Head>
                <title>BuddyFighters: Minting Page</title>
                <meta
                    name="Minting NFT page."
                    content="Here you cant mint your nft."
                />
                <link rel="icon" href="/pokeball.ico" />
            </Head>

            <main className="mint-page-main">
                <MintNFTButton />
                <NftShowcase/>
            </main>

            <footer className="back-to-home-footer">
                <GoToButton text="Back to home page" href="/"/>
            </footer>
        </>
    )
}
