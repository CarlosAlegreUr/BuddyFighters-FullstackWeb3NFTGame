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

error BuddyFightersNFT__NftDoesntExist();
error BuddyFightersNFT__MinimumPriceNotPayed();
error BuddyFightersNFT__NameTooLong();
error BuddyFightersNFT__NameTooShort();

contract BuddyFightersNFT is ERC721URIStorage, VRFConsumerBaseV2 {
    /* State variables */

    uint256 internal s_ntfCounter = 0;
    mapping(uint256 => nftTraits) private s_nftIdToAttributes;

    uint8 private constant TRAITS_NUM = 9;
    uint256 private constant MINIMUM_MINT_PRICE = 10000000000000000;
    uint256 private constant MINIMUM_IMAGE_STORE_PRICE = 10000000000000000;
    uint256 private constant MINIMUM_STATS_CHANGE_PRICE = 10000000000000;
    uint8 private constant MAX_STATS_VALUE = 254;

    // To generate random numbers
    VRFCoordinatorV2Interface private immutable i_vrfCoordinator;
    uint64 private immutable i_vrfSubsId;
    bytes32 private immutable i_keyHashGasLimit;
    uint32 private immutable i_callBackGasLimit;

    /* Type declarations */

    struct nftTraits {
        // Add SVG image value for the NFT image representation (may add outside attributes???)
        string name;
        bytes32 svgImage;
        // SVG image

        // n1 -> Face . n2 -> Boddy
        uint8 pkmN1;
        uint8 pkmN2;
        uint8 rarity;
        // [0] -> hp; [1] -> attck; [2] -> spclAttck;
        // [3] -> def; [4] -> spclDef; [5] -> vel;
        uint8[6] stats;
    }

    /* Events */

    event BuddyFightersNFTNftMinted(
        address indexed owner,
        uint8[6] indexed tknStats,
        uint256 indexed tokenId
    );
    event BuddyFightersNFTStatsGenerated(
        uint8[6] indexed stats,
        uint256 indexed tokenID
    );
    event BuddyFightersNFTStatsImproved(
        uint8[6] indexed newStats,
        uint8 quantityAdded,
        uint256 indexed tokenID
    );

    /* Modifiers */

    // Checks if an NFT's ID has already been created.
    modifier BuddyFightersNFT__nftDoesntExist(uint256 _nftID) {
        if (_nftID > s_ntfCounter) {
            revert BuddyFightersNFT__NftDoesntExist();
        }
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
    ) ERC721(name, symbol) VRFConsumerBaseV2(coordinatorAddress) {
        i_vrfCoordinator = VRFCoordinatorV2Interface(coordinatorAddress);
        i_vrfSubsId = vrfSubsId;
        i_keyHashGasLimit = keyHashGasLimit;
        i_callBackGasLimit = callBackGasLimit;
    }

    receive() external payable {}

    fallback() external payable {}

    /*
        Mints NFT.

        _onBlockhain == True: NFT's image (svg version) will be stored on the blockchain which
        results in a higher price of minting.

        _onBlockchain == False: NFT's image will only be stored in the IPFS network 
        which results in cheaper minting price.
    */
    function mintNFT(
        string memory _tokenURI,
        string memory _name,
        bytes32 _svgImage,
        uint8[2] memory _pkmonNumbers,
        bool _onBlockhain
    ) external payable returns (nftTraits memory) {
        if (msg.value < MINIMUM_MINT_PRICE) {
            revert BuddyFightersNFT__MinimumPriceNotPayed();
        }
        if (bytes(_name).length > 30) {
            revert BuddyFightersNFT__NameTooLong();
        }
        if (bytes(_name).length < 1) {
            revert BuddyFightersNFT__NameTooShort();
        }

        nftTraits memory attributes;

        attributes.name = _name;
        attributes.pkmN1 = _pkmonNumbers[0];
        attributes.pkmN2 = _pkmonNumbers[1];
        attributes.rarity = setRarity(_pkmonNumbers);
        if (_onBlockhain) attributes.svgImage = _svgImage;

        s_nftIdToAttributes[s_ntfCounter] = attributes;
        i_vrfCoordinator.requestRandomWords(
            i_keyHashGasLimit,
            i_vrfSubsId,
            1, //maybe try 1
            i_callBackGasLimit,
            6
        );

        _safeMint(msg.sender, s_ntfCounter);
        _setTokenURI(s_ntfCounter, _tokenURI);

        emit BuddyFightersNFTNftMinted(
            msg.sender,
            attributes.stats,
            s_ntfCounter
        );
        s_ntfCounter += 1;
        return attributes;
    }

    // Stores an already minted NFT svg_image to the blockchain.
    function storeSvgImageInBlockchain(uint256 _nftID, bytes32 _svgImage)
        external
        payable
        BuddyFightersNFT__nftDoesntExist(_nftID)
    {
        if (msg.value < MINIMUM_IMAGE_STORE_PRICE) {
            revert BuddyFightersNFT__MinimumPriceNotPayed();
        }
        s_nftIdToAttributes[_nftID].svgImage = _svgImage;
    }

    // Returns stats of NFT whose stats are stored in the blockchain.
    function getStats(uint256 _nftID)
        external
        view
        BuddyFightersNFT__nftDoesntExist(_nftID)
        returns (uint8[6] memory)
    {
        return s_nftIdToAttributes[_nftID].stats;
    }

    // Returns attributes of NFT stored in the blockchain.
    function getAttributes(uint256 _nftID)
        external
        view
        BuddyFightersNFT__nftDoesntExist(_nftID)
        returns (nftTraits memory)
    {
        return s_nftIdToAttributes[_nftID];
    }

    function getRarity(uint256 _nftId) external view returns (uint8) {
        return s_nftIdToAttributes[_nftId].rarity;
    }

    function getLastNFTId() external view returns (uint256) {
        return s_ntfCounter - 1;
    }

    function improveStat(
        uint256 _nftID,
        uint256 _attribute,
        uint8 _quantity
    ) public payable {
        if (msg.value < MINIMUM_STATS_CHANGE_PRICE) {
            revert BuddyFightersNFT__MinimumPriceNotPayed();
        }

        if (
            (uint256(s_nftIdToAttributes[_nftID].stats[_attribute]) +
                uint256(_quantity)) > 254
        ) {
            s_nftIdToAttributes[_nftID].stats[_attribute] = 254;
        } else {
            s_nftIdToAttributes[_nftID].stats[_attribute] += _quantity;
        }
        emit BuddyFightersNFTStatsImproved(
            s_nftIdToAttributes[_nftID].stats,
            _quantity,
            s_ntfCounter
        );
    }

    function fulfillRandomWords(
        uint256 /*requestId*/, 
        uint256[] memory randomWords
    ) internal override {
        s_nftIdToAttributes[s_ntfCounter].stats[0] =
            uint8(randomWords[0] % (MAX_STATS_VALUE)) +
            1;
        s_nftIdToAttributes[s_ntfCounter].stats[1] =
            uint8(randomWords[1] % (MAX_STATS_VALUE)) +
            1;
        s_nftIdToAttributes[s_ntfCounter].stats[2] =
            uint8(randomWords[2] % (MAX_STATS_VALUE)) +
            1;
        s_nftIdToAttributes[s_ntfCounter].stats[3] =
            uint8(randomWords[3] % (MAX_STATS_VALUE)) +
            1;
        s_nftIdToAttributes[s_ntfCounter].stats[4] =
            uint8(randomWords[4] % (MAX_STATS_VALUE)) +
            1;
        s_nftIdToAttributes[s_ntfCounter].stats[5] =
            uint8(randomWords[5] % (MAX_STATS_VALUE)) +
            1;
        emit BuddyFightersNFTStatsGenerated(
            s_nftIdToAttributes[s_ntfCounter].stats,
            s_ntfCounter
        );
    }

    function setRarity(uint8[2] memory _pkmonNumbers)
        private
        pure
        returns (uint8)
    {
        uint8 rarity = 1;
        if (
            _pkmonNumbers[0] == 144 ||
            _pkmonNumbers[0] == 145 ||
            _pkmonNumbers[0] == 146 ||
            _pkmonNumbers[0] == 150
        ) {
            rarity *= 3;
        } else {
            if (_pkmonNumbers[0] == 0 || _pkmonNumbers[0] == 151) {
                rarity *= 5;
            }
        }
        if (
            _pkmonNumbers[1] == 144 ||
            _pkmonNumbers[1] == 145 ||
            _pkmonNumbers[1] == 146 ||
            _pkmonNumbers[1] == 150
        ) {
            rarity *= 3;
        } else {
            if (_pkmonNumbers[1] == 0 || _pkmonNumbers[1] == 151) {
                rarity *= 5;
            }
        }
        return rarity;
    }
}
