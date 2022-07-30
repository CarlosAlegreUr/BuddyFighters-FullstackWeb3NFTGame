import { useWeb3Contract } from "react-moralis"

export default function MintNFTButton() {
    // const { runContractFuntion: mintnNFT } = useWeb3Contract(
    //     abi:,
    //     contractAddress:,
    //     functionName:,
    //     params:,
    //     msgValue:,
    // )

    return (
        <button style={{ color: "red", background: "orange" }}>
            {" "}
            Mint NFT{" "}
        </button>
    )
}
