import Head from "next/head";
import styles from "../styles/Home.module.css";
import { ConnectButton } from "@web3uikit/web3";

import { ethers } from "ethers";
import { useMoralis } from "react-moralis";
import { getContractAddress, getContractAbi } from "../utils/getContractInfo";

export default function Home() {
  let paymentBlock;
  const getSignerAddressMetamask = async () => {
    const provider = new ethers.BrowserProvider(window.ethereum);
    const signer = await provider.getSigner();
    const address = signer.address;
    return address;
  };

  const payAndGetBlock = async () => {
    // When sending a transaction, the value is in wei, so parseEther
    // converts ether to wei.
    const provider = new ethers.BrowserProvider(window.ethereum);
    const signer = await provider.getSigner();
    const tx = await signer.sendTransaction({
      to: "0x70997970C51812dc3A010C7d01b50e0d17dc79C8",
      value: await ethers.parseEther("0.1"),
    });

    // Often you may wish to wait until the transaction is mined
    const receipt = await tx.wait();
    paymentBlock = receipt.blockNumber;
    return receipt.blockNumber;
  };

  const handleStatsChange = async () => {
    try {
      const blockPaymentNum = await payAndGetBlock();
      const playerAddress = await getSignerAddressMetamask();

      const response = await fetch(
        "http://localhost:3005/api/changeStats/requestChange",
        {
          method: "POST",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ playerAddress, blockPaymentNum }),
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

      const contract = new ethers.Contract(
        contractAddress,
        contractABI,
        signer
      );

      const tx = await contract.requestRandomNumbers(6);
      const receipt = await tx.wait();

      const reqIdHexValue = receipt.logs[1].data;
      const bigIntValue = await BigInt(reqIdHexValue);
      const rndmNumsReqId = await Number(bigIntValue);
      console.log(rndmNumsReqId);

      const playerAddress = await getSignerAddressMetamask();
      console.log(playerAddress);

      const nftId = "0";
      const blockPaymentNum = paymentBlock;

      // playerAddress, nftId, rndmNumsReqId, blockPaymentNum

      const response = await fetch(
        "http://localhost:3005/api/changeStats/allowURIChange",
        {
          method: "POST",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            playerAddress,
            nftId,
            rndmNumsReqId,
            blockPaymentNum,
          }),
        }
      );
      const responseData = await response.json();
      const newTokenUri = responseData.newTokenUri;

      console.log(newTokenUri);

      const contractABInft = await getContractAbi(chainId, "BuddyFightersNFT");
      const contractAddressnft = await getContractAddress(
        chainId,
        "BuddyFightersNFT"
      );
      const contractmft = new ethers.Contract(
        contractAddressnft,
        contractABInft,
        signer
      );
      const txUri = await contractmft.changeStats(newTokenUri, 0);
      const receiptUri = await tx.wait();
      console.log("URI CHANGED!!!");
    } catch (error) {
      console.log(error);
    }
  };

  const allXD = async () => {
    await handleStatsChange();
    await generateRandomNumbs();
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
      const address = await getSignerAddressMetamask();
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

        <button
          onClick={async () => {
            await allXD();
          }}
        >
          ALL XD
        </button>
      </main>
      <footer>Developed by: Carlos Alegre Urquizú</footer>
    </div>
  );
}
