import { ethers } from "./ethers-5.6.esm.min.js"
import { BuddyFightersNFT_abi } from "./constants.js"
import { BuddyFightersNFT_localhost_address } from "./constants.js"

const mintButton = document.getElementById("mintButton")
mintButton.onclick = mint

const connectButton = document.getElementById("connectButton")
connectButton.onclick = connect

async function connect() {
    try {
        if (typeof window.ethereum !== "undefined") {
            console.log("METAMASK DETECTED")
            await window.ethereum.request({ method: "eth_requestAccounts" })
            console.log("Connected")
            document.getElementById("deployContract").innerHTML = "CONNECTED"
        } else {
            alert("METAMASK NOT DETECTED, PLEASE INSTALL IT")
        }
    } catch (error) {
        console.log(error)
    }
}

async function mint() {
    const provider = await new ethers.providers.Web3Provider(window.ethereum)
    const signer = await provider.getSigner()
    console.log(signer)
    const BuddyFightersNFTContract = await new ethers.Contract(
        BuddyFightersNFT_localhost_address,
        BuddyFightersNFT_abi,
        signer
    )
    console.log(BuddyFightersNFTContract)
    await BuddyFightersNFTContract.mintNFT(
        "imageURI",
        "ArticunOxdççççççç",
        "0xd89b2bf150e3b9e13446986e571fb9cab24b13cea0a43ea20a6049a85cc807cc",
        [122, 132],
        true,
        {value: ethers.utils.parseEther("0.01")}
    )
    mintButton.innerHTML = "MINT SUCCESSFUL"
}
