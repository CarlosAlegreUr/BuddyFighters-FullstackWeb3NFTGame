import Head from "next/head";
import styles from "../styles/Home.module.css";
import { ConnectButton } from "@web3uikit/web3";

import { ethers } from "ethers";
import { useMoralis } from "react-moralis";
import { getContractAddress, getContractAbi } from "../utils/getContractInfo";

export default function Home() {
  const getSignerMetamask = async () => {
    const provider = new ethers.BrowserProvider(window.ethereum);
    const signer = await provider.getSigner();
    const address = signer.address;
    return address;
  };
  const handleStatsChange = async () => {
    const playerAddress = await getSignerMetamask();
    try {
      const response = await fetch(
        "http://localhost:3005/api/changeStats/requestChange",
        {
          method: "POST",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ playerAddress }),
        }
      );

      console.log(response);
    } catch (error) {
      console.log(error);
    }
  };

  const generateRandomNumbs = async () => {
    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();

      const chainIdBig = await signer.provider.getNetwork();
      const chainId = Number(chainIdBig.chainId);
      const contractAddress = await getContractAddress(
        chainId,
        "BFNFTRndmWords"
      );
      const contractABI = await getContractAbi(chainId, "BFNFTRndmWords");

      console.log(contractABI);

      const contract = new ethers.Contract(
        contractAddress,
        contractABI,
        signer
      );
      console.log(contract);

      const connectedWallet = await signer.getAddress();

      console.log("Contract: " + contract);
      console.log("Connected w: " + connectedWallet);

      // Call the specific function in your smart contract
      const tx = await contract.requestRandomNumbers(6);
      const receipt = await tx.wait();

      const event = contract.interface.parseLog(receipt.logs[0]);
      const requestId = event.args.requestId;

      console.log("Request ID:");
      console.log(requestId);

      response = await fetch(
        "http://localhost:3005/api/changeStats/allowURIChange",
        {
          method: "POST",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ requestId }),
        }
      );
      console.log(response);
    } catch (error) {
      console.log(error);
    }
  };

  const auth = async () => {
    try {
      const response = await fetch("http://localhost:3005/api/auth/nonce", {
        method: "GET",
      });
      if (!response.ok) {
        throw new Error("HTTP error " + response.status);
      }
      const data = await response.json();

      // Step 1: Get the user's address from MetaMask
      const address = await getSignerMetamask();
      console.log(`Signer address is : ${address}`);

      // Step 2: Sign the nonce
      const nonce = data.nonce;
      console.log(`Nonce: ${nonce}`);
      const signature = await signer.signMessage(`${nonce}`);
      console.log(`Signature is: ${signature}`);

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

      if (!authResponse.ok) {
        throw new Error("HTTP error " + authResponse.status);
      }
      const authData = await authResponse.json();
      console.log(authData);

      // Saving to cookies.
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
          AUTH
        </button>
        <button
          onClick={async () => {
            await handleStatsChange();
          }}
        >
          REQUEST STATS CHANGE!
        </button>
        <button
          onClick={async () => {
            await generateRandomNumbs();
          }}
        >
          CHANGE STATS
        </button>
      </main>
      <footer>Developed by: Carlos Alegre Urquizú</footer>
    </div>
  );
}
