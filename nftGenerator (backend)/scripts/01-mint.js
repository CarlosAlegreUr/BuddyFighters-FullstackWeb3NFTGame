const { ethers, getNamedAccounts, network } = require("hardhat")
const generateImageAndGetNumbers = require("../utils/generateNFTImage")
const { developmentNets } = require("../helper-hardhat-config")

module.exports = async function (
    nftName,
    saveOnBlockchain = false,
    clientAddress
) {
    let success = [false, "Some error occurred"]
    const onDevNet = developmentNets.includes(network.name)
    const blocksToWait = onDevNet ? 1 : 6
    const { deployer } = await getNamedAccounts()
    const independentFundsManagerContract = await ethers.getContract(
        "IndependentFundsManager",
        deployer
    )

    // TODO: Generate random numbers and stats calling IndependentFundsManagerContract.
    let num1, num2
    const ratrity = await getRarity(num1, num2)
    const metadataJSONFormat = {
        name: nftName,
        description: "A BuddyFighet! So legendary, so fighter.",
        image: "",
        attributes: [
            {
                trait_type: "Pokemon Number 1",
                value: `${num1}`,
            },
            {
                trait_type: "Pokemon Number 2",
                value: `${num2}`,
            },
            {
                trait_type: "Rarity (the higher, the rarer)",
                value: rarity,
            },
        ],
    }

    // TODO: Take image from pokemonImages folder and convert it to svg format.
    let imageCIDorSvg
    if (!saveOnBlockchain) {
        if (onDevNet) {
            // TODO: Pin it in IPFS locally
        } else {
            // TODO: Pin it to NFTStorage.
        }
    } else {
        // NOT IMPLEMENTED BUT HERE ARE THE INSTRUCTIONS
        // BASE64 ENCODE THE IMAGE
        success[0] = false
        success[1] =
            "Saving NFTs on blockchain not implemented yet."
        return success
    }
    metadataJSONFormat.image = imageCIDorSvg

    let token_URI
    if (!saveOnBlockchain) {
        let JSON_CID
        if (onDevNet) {
            // TODO: Pin JSON file locally
        } else {
            // TODO: Pin JSON file to NFTStorage.
        }
        token_URI = JSON_CID
    } else {
        // NOT IMPLEMENTED BUT HERE ARE THE INSTRUCTIONS
        // BASE64 ENCODE THE JSON METADATA AND THATS THE TOKEN_URI
        success[0] = false
        success[1] =
            "Saving NFTs on blockchain not implemented yet."
        return success
    }

    //Calling mint through IndependentFundsManagerContract
    const priceToMint = await ethers.utils.parseEther("0.01")
    const txResponse = await independentFundsManagerContract.useFundsToMintNft(
        token_URI,
        clientAddress,
        { value: priceToMint }
    )
    const txReceipt = await txResponse.wait(blocksToWait)

    // TODO: Check if some errors occured in transaction.
    success[0] = true
    success[1] = ""
    return success
}

function getRarity(num1, num2) {
    rarity = 1
    if (num1 == 144 || num1 == 145 || num1 == 146 || num1 == 150) {
        rarity *= 3
    } else {
        if (num1 == 0 || num1 == 151) {
            rarity *= 5
        }
    }
    if (num2 == 144 || num2 == 145 || num2 == 146 || num2 == 150) {
        rarity *= 3
    } else {
        if (num2 == 0 || num2 == 151) {
            rarity *= 5
        }
    }
    return rarity
}
