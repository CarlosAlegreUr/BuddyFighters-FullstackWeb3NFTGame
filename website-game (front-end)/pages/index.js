import Head from "next/head";
import styles from "../styles/Home.module.css";
import { ConnectButton } from "@web3uikit/web3";

import { ethers } from "ethers";
import { useMoralis } from "react-moralis";
import { getContractAddress, getContractAbi } from "../utils/getContractInfo";

export default function Home() {
  const handleStatsChange = async () => {
    const playerAddress = "0xE9b831a1f62AC579e924224F0a916B14830605eb";

    try {
      const response = await fetch(
        "http://localhost:3005/api/changeStats/requestChange",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ playerAddress }),
        }
      );

      console.log(response);

      // Rest of the code...
    } catch (error) {
      // Error handling...
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

      // Only if using in local enviroment
      let response = await fetch(
        "http://localhost:3005/api/changeStats/generateStats",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ requestId }),
        }
      );
      console.log(response);
      //

      response = await fetch(
        "http://localhost:3005/api/changeStats/allowURIChange",
        {
          method: "POST",
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
            await handleStatsChange();
          }}
        >
          REQUEST CHANGE TEST!
        </button>
        <button
          onClick={async () => {
            await generateRandomNumbs();
          }}
        >
          GENERATE RANDOM STATS
        </button>
        <button> CHANGE STATS!</button>
      </main>
      <footer>Developed by: Carlos Alegre Urquizú</footer>
    </div>
  );
}
