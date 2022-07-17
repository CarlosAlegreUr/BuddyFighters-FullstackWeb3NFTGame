// SPDX-License-Identifier: MIT

pragma solidity ^0.8.9;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";

// For now attributes of NFT's are randomly given by your computer when runs
// the script of mint.js in the utils section => generate_NFT_image.js
//
// Future implementations will use ChainLink network sevices to:
// -Generate random stats for minted NFT's.
// -Fix NFT price to 50$.

error NftDoesntExist();
error MinimumPriceNotPayed();
error NameTooLong();
error NftStatsAreNotInBlockchain();

contract BuddyFighterNFT is ERC721URIStorage {
    
    /* Type declarations */

    struct nftAttributes {
        string name;

        uint8 hp; uint8 attck; uint8 spclAttck; 
        uint8 def; uint8 spclDef; uint8 vel;
    }


    /* State variables */

    uint256 public s_ntfCounter = 0;
    mapping (uint256 => nftAttributes) s_nftToAttributes;
    uint256 constant MINIMUM_PRICE = 10000000000000000;
    uint8 constant TRAITS_NUM = 7;
    uint8 constant MAX_STATS_VALUE = 255;


    /* Events */

    event NFTminted(address indexed owner, uint256 indexed nft_ID, nftAttributes indexed attributes);


    /* Modifiers */

   // Checks if an NFT's ID has already been created.
    modifier nftDoesntExist(uint256 _nftID) {
        if(_nftID > s_ntfCounter) {revert NftDoesntExist(); }
        _;
    }


    /* Functions */

    constructor(string memory name, string memory symbol) ERC721(name, symbol) {}


    /*
        Mints NFT.

        _onBlockhain == True: NFT's attributes will be stored on the blockchain which
        results in a higher price of minting.

        _onBlockchain == False: NFT's attributes will be stored in an IPFS network 
        URI which results in cheaper minting price.
    */
    function mintNFT(string memory _tokenURI, string memory _name, bool _onBlockhain) public payable
                                    returns(nftAttributes memory) {
        if(msg.value < MINIMUM_PRICE) { revert  MinimumPriceNotPayed(); }
        if(bytes(_name).length > 30) { revert NameTooLong(); }

        nftAttributes memory stats = generateRandomStats(_name);
        _safeMint(msg.sender, s_ntfCounter);
        _setTokenURI(s_ntfCounter, _tokenURI);
        if(_onBlockhain)
            s_nftToAttributes[s_ntfCounter] = stats;
        emit NFTminted(msg.sender, s_ntfCounter, stats);
        s_ntfCounter += 1;
        return stats;
    }   


    // function improveStats(uint256[] memory improvements) public payable {
    // 
    // }


   // Stores an already minted NFT attributes to the blockchain.
    function storeStatsInBlockchain(uint256 _nftID, nftAttributes memory _nftAttributes) public nftDoesntExist(_nftID) {
        s_nftToAttributes[_nftID] = _nftAttributes;
    }


    // Returns stats of NFT whose stats are stored in the blockchain.
    function getStats(uint256 _nftID) public view nftDoesntExist(_nftID) returns(nftAttributes memory) {
        if(bytes(s_nftToAttributes[_nftID].name).length != 0) { revert NftStatsAreNotInBlockchain(); }
        return s_nftToAttributes[_nftID];
    }


    // This function will call ChainLink functions to generate random values.
    function generateRandomStats(string memory nameOfNft) private returns(nftAttributes memory) {
        // uint8[TRAITS_NUM - 1] memory rndmStats = [255, 255, 255, 255, 255, 255]; 
        nftAttributes memory stats = nftAttributes(nameOfNft, 255, 255, 255, 255, 255, 255);
        return stats;
    }   
}
