import { useMoralis, useWeb3Contract } from "react-moralis"
import { ethers } from "ethers"
import { generateImage } from "../utils/generateNftImage"
import { getContractAddress, getContractAbi } from "../utils/getContractInfo"


export default function MintNFTButton() {
    const { chainId: chainIdHex } = useMoralis()
    const chainID = parseInt(chainIdHex)
    // Set contract address and ABI, now is hardcoded
    const args = [
        "fakeURI",
        "fakeName",
        "0xd89b2bf150e3b9e13446986e571fb9cab24b13cea0a43ea20a6049a85cc807cc",
        [132, 150],
        true,
    ]
    const contractAddress = getContractAddress(chainID, "BuddyFightersNFT")
    const contractAbi = getContractAbi(chainID, "BuddyFightersNFT")
    console.log(contractAddress)
    console.log(contractAbi)
    
    const { runContractFunction: mintNFT } = useWeb3Contract({
        abi: contractAbi,
        contractAddress: contractAddress,
        functionName: "mintNFT",
        params: args,
        msgValue: "100000000000000000",
    })

    return (
        <div>
            <button
                onClick={async function () {
                    console.log("clicked")
                    await mintNFT()
                    console.log("minted")
                }}
                style={{
                    color: "red",
                    background: "orange",
                    blockSize: 33,
                    borderRadius: 9,
                    marginRight: 3,
                }}
            >
                {" "}
                Mint NFT{" "}
            </button>
            <input placeholder="lowest price 0.01 ETH" />
        </div>
    )
}
