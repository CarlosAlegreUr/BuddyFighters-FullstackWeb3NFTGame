import Head from 'next/head'
import Image from 'next/image'
import styles from '../styles/Home.module.css'
import { Blockie } from '@web3uikit/web3'

export default function Home() {
  return (
    <div className={styles.container}>
      <Head>
          <title>BuddyFighters</title>
          <meta name="description" content="PATATAS XD" />
          <link rel="icon" href="/favicon.ico" />
      </Head>
      <Blockie/>
      Koalas
    </div>
  )
}
