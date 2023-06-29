import React from "react";
import { ethers } from "ethers";
import { getContractAddress, getContractAbi } from "../utils/getContractInfo";

export default function ChangeStatsSection() {
  const getSignerAddressMetamask = async () => {
    const provider = new ethers.BrowserProvider(window.ethereum);
    const signer = await provider.getSigner();
    const address = signer.address;
    return address;
  };

  const payForTicket = async () => {
    alert("This payment is to cover the cost of the project's backend.");
    const provider = new ethers.BrowserProvider(window.ethereum);
    const signer = await provider.getSigner();
    const chainIdBig = await signer.provider.getNetwork();
    const chainId = Number(chainIdBig.chainId);
    const contractAddress = await getContractAddress(
      chainId,
      "BuddyFightersNFT"
    );

    const contractABI = await getContractAbi(chainId, "BuddyFightersNFT");

    const contract = new ethers.Contract(contractAddress, contractABI, signer);
    console.log("Calling ticket function");
    const args = { value: await ethers.parseEther("0.1") };
    const tx = await contract.buyTicket(args);
    await tx.wait();
  };

  const requestStatsChange = async () => {
    try {
      await payForTicket();

      const response = await fetch(
        "http://localhost:3005/api/changeStats/requestChange",
        {
          method: "POST",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      console.log(response);
    } catch (error) {
      console.log(error);
    }
  };

  const generateRandomNumbsAndUpdateURI = async () => {
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

      alert("This payment is to generate random stats.");
      const tx = await contract.requestRandomNumbers(6);
      const receipt = await tx.wait();

      const reqIdHexValue = receipt.logs[1].data;
      const bigIntValue = await BigInt(reqIdHexValue);
      const rndmNumsReqId = await Number(bigIntValue);

      const nftId = "0";

      const response = await fetch(
        "http://localhost:3005/api/changeStats/allowURIChange",
        {
          method: "POST",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            nftId,
            rndmNumsReqId,
          }),
        }
      );
      console.log(response);
      const responseData = await response.json();
      const newTokenUri = responseData.newTokenUri;

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
      alert("This payment is to change the URI.");
      await contractmft.changeStats(newTokenUri, 0);
      await tx.wait();
      console.log(newTokenUri);
      alert(
        `URI has been changed! Check here your new nft stats: ${newTokenUri}`
      );
    } catch (error) {
      console.log(error);
    }
  };

  const changeStatsProcess = async () => {
    await requestStatsChange();
    await generateRandomNumbsAndUpdateURI();
  };

  return (
    <section>
      <button
        onClick={async () => {
          await changeStatsProcess();
        }}
      >
        CHANGE STATS!
      </button>
    </section>
  );
}
