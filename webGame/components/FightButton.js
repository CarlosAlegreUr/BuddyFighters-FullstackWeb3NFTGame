import { useWeb3Contract } from "react-moralis"

export default function FightButton() {
    // const { runContractFuntion: mintnNFT } = useWeb3Contract(
    //     abi:,
    //     contractAddress:,
    //     functionName:,
    //     params:,
    //     msgValue:,
    // )

    return (
        <div>
            <h3 style={{ marginLeft: 54 }}> CHALLENGE OTHER PLAYER!!! </h3>
            <input placeholder="rival's address" style={{ marginRight: 22 }} />
            <input placeholder="bid ammount (>0.01 ETH)" />
            <br /> <br />
            <button
                style={{
                    color: "red",
                    background: "orange",
                    marginLeft: 110,
                    borderRadius: 12,
                    borderBlockColor: "purple",
                    blockSize: 45,
                }}
            >
                {" "}
                Challenge to a fight!!!{" "}
            </button>
        </div>
    )
}
