// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@chainlink/contracts/src/v0.8/VRFConsumerBaseV2.sol";
import "@chainlink/contracts/src/v0.8/interfaces/VRFCoordinatorV2Interface.sol";

/* Customed erros */
error BuddyFightersNFT__MinimumPriceNotPayed();
error BuddyFightersNFT__IsNotTokenOwner();

/**
 * @title BuddyFighters' NFTs contract.
 * @author Carlos Alegre Urquizú
 *
 * @notice This contract manages ownership of your nfts from BuddyFighters collection.
 * Only backend addresses owned by the developers team can call some functions of the
 * contract. Though events are emitted so end user can be sure backend does what promises.
 * If our devs betray consumers you can notice by listening if the events are being emitted
 * with the expected values.
 *
 * @dev Only backend addresses by devs team can call some functions of the contract. Though
 * events are emitted so end user can check backend does what promises.
 */
contract BuddyFightersNFT is ERC721URIStorage, ERC721Enumerable, Ownable {
    /* State variables */
    uint256 private constant MINIMUM_MINT_PRICE = 10000000000000000;
    uint256 private constant MINIMUM_STATS_CHANGE_PRICE = 10000000000000;
    uint8 private constant MAX_STATS_VALUE = 254;

    /* Events */
    event BuddyFightersNFT__NftMinted(
        address indexed owner,
        uint256 indexed tokenId
    );
    event BuddyFightersNFT__StatsChanged(
        address indexed owner,
        uint256 indexed tokenID
    );

    /* Modifiers */

    /**
     * Minimum price modifier.
     *
     * @dev Sets minimum price in ETH (or blockchain coin) for msg.value
     * for function to be executed. If not reverts with customed error.
     */
    modifier minimumPrice(uint256 _price) {
        if (msg.value < _price) {
            revert BuddyFightersNFT__MinimumPriceNotPayed();
        }
        _;
    }

    /**
     * Checking if an address is owner of a token.
     *
     * @dev Checks if `_tokenOwner` address owns token with `_tokenId`.
     * If not reverts with customed error.
     */
    modifier isTokenOwner(uint256 _tokenId, address _tokenOwner) {
        if (ownerOf(_tokenId) != _tokenOwner) {
            revert BuddyFightersNFT__IsNotTokenOwner();
        }
        _;
    }

    /* Functions */

    /**
     * Runs on deploy.
     *
     * @dev Initializes the collection and makes it a Chainlink VRF consumer.
     *
     * @param _name Name of NFT collection.
     *
     * @param _symbol Symbol of NFT collection.
     *
     * See Chainlink VRF docs for more info on arguments required.
     */
    constructor(
        string memory _name,
        string memory _symbol,
        address _coordinatorAddress,
        uint64 _vrfSubsId,
        bytes32 _keyHashGasLimit,
        uint32 _callBackGasLimit
    ) ERC721(_name, _symbol) {}

    /**
     * Someone is sending us money. (:D)
     *
     * @dev Someone is sending us money. (:D)
     *
     * @notice If you wanna thank the devs team you can call this function
     * to send us a tip. (:D)
     */
    receive() external payable {}

    /**
     * Someone might be sending us money. (:D)
     *
     * @dev Someone might be sending us money. (:D)
     *
     * @notice If you wanna thank the devs team you can call this function with
     * some coin from the blockchain to send us a tip. (:D)
     */
    fallback() external payable {}

    /* External functions */

    /**
     * Mints new token.
     *
     * @dev Calls _safeMint(), new token's ID is totalSupply() and sets tokenURI with
     * _setTokenURI(). Warning! Backend must make sure arguments have the correct values.
     *
     * @notice Emits an event so clients can see backend called this function for them.
     */
    function mintNft(
        string memory _tokenURI,
        address _clientAddress
    ) external payable minimumPrice(MINIMUM_MINT_PRICE) onlyOwner {
        uint256 tokenId = totalSupply();
        _safeMint(_clientAddress, tokenId);
        _setTokenURI(tokenId, _tokenURI);
        emit BuddyFightersNFT__NftMinted(_clientAddress, tokenId);
    }

    /**
     * Changes stats of NFT.
     *
     * @notice Emits an event so client can see backend called this function on his token.
     *
     * @dev To change stats backend calls this function which sets the new URI.
     * Backend should make sure function is called with correct values.
     *
     * @param _newTokenURI is URI pointing to JSON metadata on IPFS or on-chain
     * metadata in JSON format encoded in base64.
     */
    function changeStats(
        string memory _newTokenURI,
        address _tokenOwner,
        uint256 _tokenId
    )
        external
        payable
        minimumPrice(MINIMUM_STATS_CHANGE_PRICE)
        onlyOwner
        isTokenOwner(_tokenId, _tokenOwner)
    {
        super._setTokenURI(_tokenId, _newTokenURI);
        emit BuddyFightersNFT__StatsChanged(_tokenOwner, _tokenId);
    }

    /**
     * Function to withdraw tips clients give us.
     *
     * @dev Function to retire funds from contract in case of tips.
     */
    function withdrawContractBalance(
        address _accountToSendBalance
    ) external onlyOwner returns (bool) {
        (bool success, ) = _accountToSendBalance.call{
            value: address(this).balance
        }("");
        return success;
    }

    /**
     * @dev The following functions are here just for solving inheritance ambiguities in
     * inheritance tree.
     */

    /* Public functions */

    /**
     * @dev This function is here just for solving inheritance ambiguities in
     * inheritance tree.
     */
    function supportsInterface(
        bytes4 interfaceId
    ) public view override(ERC721, ERC721Enumerable) returns (bool) {
        return super.supportsInterface(interfaceId);
    }

    /**
     * @dev This function is here just for solving inheritance ambiguities in
     * inheritance tree.
     */
    function tokenURI(
        uint256 tokenId
    ) public view override(ERC721, ERC721URIStorage) returns (string memory) {
        return super.tokenURI(tokenId);
    }

    /* Internal functions */

    /**
     * @dev This function is here just for solving inheritance ambiguities in
     * inheritance tree.
     */
    function _burn(
        uint256 tokenId
    ) internal override(ERC721, ERC721URIStorage) {
        super._burn(tokenId);
    }

    /**
     * @dev This function is here just for solving inheritance ambiguities in
     * inheritance tree.
     */
    function _beforeTokenTransfer(
        address from,
        address to,
        uint256 firstTokenId,
        uint256 batchSize
    ) internal override(ERC721, ERC721Enumerable) {
        super._beforeTokenTransfer(from, to, firstTokenId, batchSize);
    }
}
