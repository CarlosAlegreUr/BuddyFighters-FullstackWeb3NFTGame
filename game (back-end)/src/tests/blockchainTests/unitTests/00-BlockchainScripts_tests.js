// const { assert, expect } = require("chai")
// const { ethers, getNamedAccounts, deployments, network } = require("hardhat")
// const { developmentNets } = require("../../../helper-hardhat-config")
// const {
//     FRONT_END_CONTRACTS_TESTING_FILE,
// } = require("../../../blockchainScripts/04-updateFrontEnd")
// const fs = require("fs")

// describe("Scripts tests", function () {
//     beforeEach(async function () {})

//     if (network.name === "hardhat" || network.name === "localhost") {
//         describe("update-front-end.js tests", function () {
//             it("Only 1 IndependentFundsManagers, 1 BuddyFightersNFT contract and 0 mocks.", async function () {
//                 await deployments.fixture("all")
//                 const currentContracts = JSON.parse(
//                     fs.readFileSync(FRONT_END_CONTRACTS_TESTING_FILE),
//                     "utf-8"
//                 )
//                 let namesArray = [
//                     "IndependentFundsManager",
//                     "BuddyFightersNFT",
//                     "VRFCoordinatorV2Mock",
//                 ]
//                 let countingArray = [0, 0, 0]
//                 const chaindID = network.config.chainId.toString()
//                 if (chaindID in currentContracts) {
//                     await currentContracts[chaindID].forEach((contract) => {
//                         namesArray.forEach((name, index) => {
//                             if (contract.contractName === name)
//                                 countingArray[index] += 1
//                         })
//                     })
//                 }
//                 assert.equal(countingArray[0], 1)
//                 assert.equal(countingArray[1], 1)
//                 assert.equal(countingArray[2], 0)
//             })
//         })
//     }

//     describe("mint.js tests", function () {
//         it("Mints correctly.", async function () {
//             assert(1 === 0)
//         })
//     })

//     describe("fight.js tests", function () {
//         it("Keeps track of fights correctly.", async function () {
//             assert(1 === 0)
//         })
//     })
// })

// // it("When improvig stats, correct quantity is added.", async function () {
// //    
// // })
// // it("Metadata is created and retrieved from blockchain correctly.", async function () {
// //
// // })
// // it("If name too long or too short, NFT not minted.", async function () {
// //    
// // })

// // it("Rarity calculated correctly.", async function () {
// //     allRarities = [1, 3, 5, 9, 15, 25]
// //     payed = ethers.utils.parseEther("0.01")
// //     await buddyFightersNFTContract.mintNFT(
// //         "Fake_URI",
// //         "NameOfNftAt0",
// //         svgImage,
// //         [100, 101],
// //         false,
// //         { value: payed }
// //     )
// //     await buddyFightersNFTContract.mintNFT(
// //         "Fake_URI",
// //         "NameOfNftAt1",
// //         svgImage,
// //         [45, 150],
// //         false,
// //         { value: payed }
// //     )
// //     await buddyFightersNFTContract.mintNFT(
// //         "Fake_URI",
// //         "NameOfNftAt2",
// //         svgImage,
// //         [151, 5],
// //         false,
// //         { value: payed }
// //     )
// //     await buddyFightersNFTContract.mintNFT(
// //         "Fake_URI",
// //         "NameOfNftAt3",
// //         svgImage,
// //         [150, 150],
// //         false,
// //         { value: payed }
// //     )
// //     await buddyFightersNFTContract.mintNFT(
// //         "Fake_URI",
// //         "NameOfNftAt4",
// //         svgImage,
// //         [0, 150],
// //         false,
// //         { value: payed }
// //     )
// //     await buddyFightersNFTContract.mintNFT(
// //         "Fake_URI",
// //         "NameOfNftAt5",
// //         svgImage,
// //         [0, 151],
// //         false,
// //         { value: payed }
// //     )
// //     for (i = 0; i < stats.length; i++) {
// //         stats = await buddyFightersNFTContract.getAttributes(
// //             i.toString()
// //         )
// //         expect(allRarities).to.include(stats.rarity)
// //     }
// // })
// // it("When minting, if not desired, NFT's image is not on blockchain.", async function () {
// //     
// // })
