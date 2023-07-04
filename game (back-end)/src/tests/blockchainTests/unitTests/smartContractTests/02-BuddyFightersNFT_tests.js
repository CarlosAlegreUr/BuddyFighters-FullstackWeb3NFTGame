const { assert, expect } = require("chai");
const { ethers, getNamedAccounts, deployments } = require("hardhat");
const { prices } = require("../../../../businessConstants.json");
const { ECDH } = require("crypto");

describe("BuddyFigthersNFT.sol tests", function () {
    let deployer,
        client1,
        client2,
        inputControlModularJustContract,
        buddyFightersNFTContract,
        buddyFightersNFTClient1,
        buddyFightersNFTClient2,
        mintedEventFilter,
        statsChangeEventFilter,
        priceToChangeStats;

    // Helper functions
    async function mintNftToDeployer() {
        const nftId = await ethers.toNumber(
            await buddyFightersNFTContract.totalSupply()
        );
        const txResponse = await buddyFightersNFTContract.mintNft(
            `Fake_URI_${nftId}`
        );
        const txReceipt = await txResponse.wait();
        const txBlock = txReceipt.blockNumber;
        return { nftId: nftId, txBlock: txBlock };
    }

    beforeEach(async function () {
        const {
            deployer: d,
            client1: c,
            client2: c2,
        } = await getNamedAccounts();
        deployer = d;
        client1 = c;
        client2 = c2;
        // Contracts with signers
        inputControlModularJustContract = await ethers.getContract(
            "InputControlModular"
        );

        buddyFightersNFTContract = await ethers.getContract(
            "BuddyFightersNFT",
            deployer
        );
        buddyFightersNFTClient1 = await ethers.getContract(
            "BuddyFightersNFT",
            client1
        );
        buddyFightersNFTClient2 = await ethers.getContract(
            "BuddyFightersNFT",
            client2
        );
        // Event filters
        mintedEventFilter = await buddyFightersNFTClient1.filters
            .BFNFT__NftMinted;
        statsChangeEventFilter = await buddyFightersNFTClient1.filters
            .BFNFT__StatsChanged;
        // Prices
        priceToChangeStats = await ethers.parseEther(
            await prices.changeStatsTicket.toString()
        );
    });

    it("mintNft: NFTs' metadata, id and owner are stored correctly.", async function () {
        for (i = 0; i < 3; i++) {
            const { nftId: id } = await mintNftToDeployer();
            assert.deepEqual(
                await buddyFightersNFTContract.tokenURI(id),
                `Fake_URI_${id}`
            );
            assert.deepEqual(
                await buddyFightersNFTContract.ownerOf(id),
                deployer
            );
        }
    });

    it("mintNft: Event emitted correctly.", async function () {
        const { nftId: id, txBlock } = await mintNftToDeployer();
        const query = await buddyFightersNFTContract.queryFilter(
            mintedEventFilter,
            txBlock
        );
        const owner = query[0].args[0];
        const tokenId = await ethers.toNumber(query[0].args[1]);
        const tokenUri = query[0].args[2];

        assert.deepEqual(owner, deployer);
        assert.equal(tokenId, id);
        assert.deepEqual(tokenUri, `Fake_URI_${id}`);
    });

    it("mintNft: Only owner can call.", async function () {
        await expect(buddyFightersNFTClient1.mintNft(`Fake_URI_NotOnwer!`)).to
            .be.reverted;
        await expect(buddyFightersNFTClient2.mintNft(`Fake_URI_NotOnwer!`)).to
            .be.reverted;
    });

    it("changeStats: URI changes and owner needs to input permissions.", async function () {
        const prevUri = await buddyFightersNFTContract.tokenURI(0);
        await buddyFightersNFTContract.changeStats("NEW!", 0);
        const newUri = await buddyFightersNFTContract.tokenURI(0);
        assert.deepEqual(newUri, "NEW!");
        assert.notDeepEqual(prevUri, newUri);
    });

    it("buyTicket() && getTicketsOf(): Tickets are added and read correctly.", async function () {
        let ticketsOfC1 = await ethers.toNumber(
            await buddyFightersNFTContract.getTicketsOf(client1)
        );
        assert.equal(0, ticketsOfC1);
        await buddyFightersNFTClient1.buyTicket({ value: priceToChangeStats });
        ticketsOfC1 = await ethers.toNumber(
            await buddyFightersNFTContract.getTicketsOf(client1)
        );
        assert.equal(1, ticketsOfC1);
    });

    it("changeStats: You must have tickets and they are spent correctly.", async function () {
        // Give nft to client 1 and allow call to change stats
        await buddyFightersNFTContract.transferFrom(deployer, client2, 0);
        const types = [{ type: "string" }, { type: "uint256" }];
        const values = ["SUPER_NEW_URI", 0];
        const coder = new ethers.AbiCoder();
        const abiEncodedInput = await coder.encode(types, values);
        const validInput = await ethers.keccak256(abiEncodedInput);
        await buddyFightersNFTContract.allowInputs(
            client2,
            [validInput],
            "changeStats(string,uint256)",
            false
        );
        // Correct input but no tickets bought.
        await expect(
            buddyFightersNFTClient2.changeStats("SUPER_NEW_URI", 0)
        ).to.be.revertedWithCustomError(
            buddyFightersNFTContract,
            "BFNFT__YouHaveNoTcikets"
        );
        // Ticket bought all should pass
        await buddyFightersNFTClient2.buyTicket({ value: priceToChangeStats });
        await buddyFightersNFTClient2.changeStats("SUPER_NEW_URI", 0);
        const newUri = await buddyFightersNFTContract.tokenURI(0);
        assert.deepEqual(newUri, "SUPER_NEW_URI");
        let ticketsOfC2 = await ethers.toNumber(
            await buddyFightersNFTContract.getTicketsOf(client2)
        );
        assert.equal(0, ticketsOfC2);
    });

    it("changeStats: InputControl correctly implemented.", async function () {
        // Client has tickets and its owner, only thing can revert now is InputCotrol
        await buddyFightersNFTContract.transferFrom(deployer, client1, 1);
        await buddyFightersNFTClient1.buyTicket({ value: priceToChangeStats });
        await expect(
            buddyFightersNFTClient1.changeStats("SUPER_NEW_URI", 1)
        ).to.be.revertedWithCustomError(
            inputControlModularJustContract,
            "InputControlModular__NotAllowedInput"
        );
        // Giving permission
        const types = [{ type: "string" }, { type: "uint256" }];
        const values = ["SUPER_NEW_URI", 1];
        const coder = new ethers.AbiCoder();
        const abiEncodedInput = await coder.encode(types, values);
        const validInput = await ethers.keccak256(abiEncodedInput);
        await buddyFightersNFTContract.allowInputs(
            client1,
            [validInput],
            "changeStats(string,uint256)",
            false
        );
        await buddyFightersNFTClient1.changeStats("SUPER_NEW_URI", 1);
        const tokenUri = await buddyFightersNFTContract.tokenURI(1);
        assert.deepEqual(tokenUri, "SUPER_NEW_URI");
    });

    it("changeStats: Only token owner can change the URI.", async function () {
        await expect(
            buddyFightersNFTContract.changeStats("NewFakeURI", 1)
        ).revertedWithCustomError(
            buddyFightersNFTContract,
            "BFNFT__YouAreNotTokenOwner"
        );
    });

    it("changeStats: Event emitted correctly.", async function () {
        const txResponse = await buddyFightersNFTContract.changeStats(
            "HEHE",
            2
        );
        const txReceipt = await txResponse.wait();
        const txBlock = txReceipt.blockNumber;
        const query = await buddyFightersNFTContract.queryFilter(
            statsChangeEventFilter,
            txBlock
        );
        const owner = query[0].args[0];
        const tokenId = await ethers.toNumber(query[0].args[1]);
        const newUri = query[0].args[2];

        assert.equal(owner, deployer);
        assert.equal(tokenId, 2);
        assert.deepEqual(newUri, "HEHE");
    });

    it("buyTicket: Minimum price must be payed.", async function () {
        const badPrice = await ethers.parseEther(
            await (prices.changeStatsTicket - 0.01).toString()
        );
        await expect(
            buddyFightersNFTClient1.buyTicket({ value: badPrice })
        ).to.be.revertedWithCustomError(
            buddyFightersNFTContract,
            "BFNFT__NotPayedEnough"
        );
    });
});
