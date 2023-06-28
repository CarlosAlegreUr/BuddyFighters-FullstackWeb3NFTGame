import Head from "next/head";
import styles from "../styles/Home.module.css";
import { ConnectButton } from "@web3uikit/web3";

import { ethers } from "ethers";
import { useMoralis } from "react-moralis";

import ChangeStats from "../components/changeStats";

export default function Home() {
  const auth = async () => {
    try {
      const response = await fetch("http://localhost:3005/api/auth/nonce", {
        method: "GET",
      });
      console.log(response);

      // Step 1: Get the user's address from MetaMask
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const address = signer.address;

      // Step 2: Sign the nonce
      const data = await response.json();
      const nonce = data.nonce;
      const signature = await signer.signMessage(`${nonce}`);

      // Step 3: Send the address, nonce, and signature to the server
      const authResponse = await fetch(
        "http://localhost:3005/api/auth/authenticate",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ address, nonce, signature }),
        }
      );
      console.log(authResponse);

      // Saving to cookies.
      const authData = await authResponse.json();
      const currentDate = new Date();
      const oneDay = 24 * 60 * 60 * 1000;
      const nextDay = new Date(currentDate.getTime() + oneDay);
      const expiration = await nextDay.toUTCString();

      let cookieString = `bfnftjwt=${authData.token}; expires=${expiration}; path=/;`;
      // Disable secure flag in development
      cookieString += " secure=false;";
      document.cookie = cookieString;
    } catch (error) {
      console.log(error);
    }
  };

  const sseConnect = async () => {
    try {
      const sse = new EventSource(
        "http://localhost:3005/api/matchmaking/fightradaron",
        { withCredentials: true }
      );

      // sse.addEventListener(
      //   "message",
      //   function (event) {
      //     // Handle general message event
      //     console.log(event.data);
      //   },
      //   false
      // );

      // sse.addEventListener(
      //   "errorMessage",
      //   function (event) {
      //     // Handle error message event
      //     console.error(event.data);
      //   },
      //   false
      // );

      // sse.onerror = function (event) {
      //   // Handle connection error
      //   console.error("EventSource error:", event);
      // };
    } catch (error) {
      console.log(error);
    }
  };

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
        <button
          onClick={async () => {
            await auth();
          }}
        >
          VERIFY OWNERSHIP OF WALLET
        </button>

        <ChangeStats />

        <button
          onClick={async () => {
            await sseConnect();
          }}
        >
          ACTIVATE BATTLE RADAR
        </button>

        <button> POST CHALLENGE! </button>
        <h1>Challenges list</h1>
        <button> SEND FIGHT REQUEST </button>
      </main>
      <footer>Developed by: Carlos Alegre Urquizú</footer>
    </div>
  );
}
