// SPDX-License-Identifier: MIT

pragma solidity ^0.8.9;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@chainlink/contracts/src/v0.8/VRFConsumerBaseV2.sol";
import "@chainlink/contracts/src/v0.8/interfaces/VRFCoordinatorV2Interface.sol";

// For now attributes of NFT's are randomly given by your computer when runs
// the script of mint.js in the utils section => generate_NFT_image.js
//
// Future implementations will use ChainLink network sevices to:
// -Generate random stats for minted NFT's.
// -Fix NFT price to 50$.

error NftDoesntExist();
error MinimumPriceNotPayed();
error NameTooLong();
error NameTooShort();
error NftStatsAreNotInBlockchain();

contract BuddyFightersNFT is ERC721URIStorage, VRFConsumerBaseV2 {

    /* State variables */

    uint256 internal s_ntfCounter = 0;
    mapping (uint256 => string) private s_nftIdToURI;
    mapping (uint256 => nftTraits) private s_nftIdToAttributes;

    uint8 constant private TRAITS_NUM = 7;
    uint256 constant private MINIMUM_MINT_PRICE = 10000000000000000;
    uint256 constant private MINIMUM_STATS_CHANGE_PRICE = 10000000000000;
    uint8 constant private MAX_STATS_VALUE = 255;
    uint64 constant private MAX_POKEMON_NUM = 151;

    // To generate random numbers
    VRFCoordinatorV2Interface immutable private i_vrfCoordinator;
    uint64 immutable private i_vrfSubsId;
    bytes32 immutable private i_keyHashGasLimit;
    uint32 immutable private i_callBackGasLimit;


    /* Type declarations */

    enum Rarirty {
        COMMON,
        SEMILEGENDARY,
        LEGENDARY,
        GOD
    }

    struct nftTraits {

        // Add SVG image value for the NFT image representation (may add outside attributes???)
        string name;

        // [0] -> hp; [1] -> attck; [2] -> spclAttck; 
        // [3] -> def; [4] -> spclDef; [5] -> vel;
        uint8[TRAITS_NUM - 1] stats;
    }

    
    /* Events */

    event BuddyFightersNFTNftMinted(address indexed owner, string indexed tokenURI, uint256 indexed tokenId);
    event BuddyFightersNFTPokemonMixNumbersGenerated(uint256[] indexed numbers);


    /* Modifiers */

   // Checks if an NFT's ID has already been created.
    modifier nftDoesntExist(uint256 _nftID) {
        if(_nftID > s_ntfCounter) {revert NftDoesntExist(); }
        _;
    }


    /* Functions */

    // TODO => callbackFunction / retrieve function

    constructor(
        string memory name, 
        string memory symbol, 
        address coordinatorAddress, 
        uint64 vrfSubsId, 
        bytes32 keyHashGasLimit,
        uint32 callBackGasLimit
    ) 
    ERC721(name, symbol) VRFConsumerBaseV2(coordinatorAddress) {
        i_vrfCoordinator = VRFCoordinatorV2Interface(coordinatorAddress);
        // vrfCoordinator.createSubscription()
        // i_vrfCoordinator.addConsumer(vrfSubsId, this.address);
        i_vrfSubsId = vrfSubsId;
        i_keyHashGasLimit = keyHashGasLimit;
        i_callBackGasLimit = callBackGasLimit;
    }


    /*
        Mints NFT.

        _onBlockhain == True: NFT's attributes will be stored on the blockchain which
        results in a higher price of minting.

        _onBlockchain == False: NFT's attributes will be stored in an IPFS network 
        URI which results in cheaper minting price.
    */
    function mintNFT(string memory _tokenURI, string memory _name, bool _onBlockhain) external payable
                                    returns(nftTraits memory) {
        if(msg.value < MINIMUM_MINT_PRICE) { revert  MinimumPriceNotPayed(); }
        if(bytes(_name).length > 30) { revert NameTooLong(); }
        if(bytes(_name).length < 1) { revert NameTooShort(); }

        nftTraits memory stats = generateRandomStats(_name);
        _safeMint(msg.sender, s_ntfCounter);
        _setTokenURI(s_ntfCounter, _tokenURI);

        if(_onBlockhain)
            s_nftIdToAttributes[s_ntfCounter] = stats;
        s_nftIdToURI[s_ntfCounter] = _tokenURI;

        emit BuddyFightersNFTNftMinted(msg.sender,  _tokenURI, s_ntfCounter);
        s_ntfCounter += 1;
        return stats;
    }   


    function generatePokemonFusionNumbers() external payable returns(uint256[] memory) {
        /*uint256 requestId =*/ i_vrfCoordinator.requestRandomWords(i_keyHashGasLimit, i_vrfSubsId, 3, i_callBackGasLimit, 2);
        uint256[] memory rndmNum;
        fulfillRandomWords(i_vrfSubsId, rndmNum);
        rndmNum[0] = rndmNum[0]%MAX_POKEMON_NUM; 
        rndmNum[1] = rndmNum[1]%MAX_POKEMON_NUM; 
        emit BuddyFightersNFTPokemonMixNumbersGenerated(rndmNum);
        return rndmNum;
    }



    //TODO
    function improveStat(uint256 _nftID, uint256 _attribute, uint8 _quantity) public payable {
        if(msg.value < MINIMUM_STATS_CHANGE_PRICE) { revert MinimumPriceNotPayed(); }

        if((s_nftIdToAttributes[_nftID].stats[_attribute] + _quantity) > 255){
            s_nftIdToAttributes[_nftID].stats[_attribute] = 255;
        }else {
            s_nftIdToAttributes[_nftID].stats[_attribute] += _quantity;
        }
    }


   // Stores an already minted NFT attributes to the blockchain.
    function storeStatsInBlockchain(uint256 _nftID, nftTraits memory _nftTraits) external nftDoesntExist(_nftID) {
        s_nftIdToAttributes[_nftID] = _nftTraits;
    }


    // Returns stats of NFT whose stats are stored in the blockchain. 
    function getStats(uint256 _nftID) external view nftDoesntExist(_nftID) returns(nftTraits memory) {
        if(bytes(s_nftIdToAttributes[_nftID].name).length != 0) { revert NftStatsAreNotInBlockchain(); }
        return s_nftIdToAttributes[_nftID];
    }


    function getLastNFTId() public view returns(uint256) {
        return s_ntfCounter;
    }


    function fulfillRandomWords(uint256 /*requestId*/, uint256[] memory randomWords) internal virtual override {

    }


    //TODO
    // This function will call ChainLink functions to generate random values.
    function generateRandomStats(string memory nameOfNft) private returns(nftTraits memory) {
        // uint8[TRAITS_NUM - 1] memory rndmStats = [255, 255, 255, 255, 255, 255];
        uint8[TRAITS_NUM - 1] memory rndmStats = [255, 255, 255, 255, 255, 255];
        nftTraits memory stats = nftTraits(nameOfNft, rndmStats);
        return stats;
    }   
}
