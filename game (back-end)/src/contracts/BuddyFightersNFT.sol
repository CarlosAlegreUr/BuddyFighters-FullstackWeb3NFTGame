// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "input-control-contract/modularVersion/IInputControlModular.sol";

import "./Fight.sol";

/* Customed erros */
error BFNFT__MinimumPriceNotPayed();
error BFNFT__IsNotTokenOwner();

/**
 * @title BuddyFighters' NFTs contract.
 * @author Carlos Alegre Urquizú
 *
 * @notice This contract manages your nfts from BuddyFighters collection. It uses
 * InteractionControl contract to create "agreements" on which NFT's to minst and how
 * to upgrade them between costumer and the collection devs.
 */
contract BuddyFightersNFT is ERC721URIStorage, ERC721Enumerable, Ownable {
    /* State variables */
    uint256 private constant STATS_CHANGE_PRICE = 10000000000000000;

    IInputControlModular private i_InputControl;

    /* Events */
    event BFNFT__NftMinted(
        address indexed owner,
        uint256 tokenId,
        string tokenURI
    );
    event BFNFT__StatsChanged(
        address indexed owner,
        uint256 indexed tokenID,
        string newURI
    );

    /**
     * Checking if an address is owner of a token.
     *
     * @dev Checks if `_tokenOwner` address owns token with `_tokenId`.
     * If not reverts with customed error.
     */
    modifier isTokenOwner(uint256 _tokenId, address _tokenOwner) {
        if (ownerOf(_tokenId) != _tokenOwner) {
            revert BFNFT__IsNotTokenOwner();
        }
        _;
    }

    /**
     * @dev Sets minimum price in ETH (or blockchain coin) for msg.value
     * for function to be executed. If not reverts with customed error.
     */
    modifier minimumPricePayed(uint256 _price) {
        if (msg.value < _price) {
            revert BFNFT__MinimumPriceNotPayed();
        }
        _;
    }

    modifier checkAllowedInput(
        bytes4 _funcSelec,
        address _callerAddress,
        bytes32 _input
    ) {
        i_InputControl.isAllowedInput(_funcSelec, _callerAddress, _input);
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
        address _inputControlContractAddress
    ) ERC721(_name, _symbol) {
        i_InputControl = IInputControlModular(_inputControlContractAddress);
    }

    /* External functions */

    /**
     * @dev Mints new token calling _safeMint(), new token's ID is totalSupply() and sets tokenURI with
     * _setTokenURI(). BaseURI is empty.
     *
     * @notice Client must call this function but first the interaction must me allowed by backend.
     */
    function mintNft(string memory _tokenURI) external payable {
        uint256 tokenId = totalSupply();
        _safeMint(msg.sender, tokenId);
        _setTokenURI(tokenId, _tokenURI);
        emit BFNFT__NftMinted(msg.sender, tokenId, _tokenURI);
    }

    /**
     * @dev Changes stats of NFT because of change in URI.
     *
     * @notice Client must call this function but first the interaction must me allowed by backend.
     *
     * @param _newTokenURI is URI pointing to JSON metadata on IPFS or on-chain
     * metadata in JSON format encoded in base64.
     */
    function changeStats(
        string memory _newTokenURI,
        uint256 _tokenId
    )
        external
        payable
        isTokenOwner(_tokenId, msg.sender)
        minimumPricePayed(STATS_CHANGE_PRICE)
        checkAllowedInput(
            bytes4(keccak256(bytes("changeStats(string,uint256)"))),
            msg.sender,
            keccak256(abi.encode(_newTokenURI, _tokenId))
        )
    {
        _setTokenURI(_tokenId, _newTokenURI);
        emit BFNFT__StatsChanged(msg.sender, _tokenId, _newTokenURI);
    }

    function allowInputs(
        address _callerAddress,
        bytes32[] calldata _validInputs,
        string calldata _funcSignature,
        bool _isSequence
    ) external onlyOwner {
        i_InputControl.allowInputsFor(
            _callerAddress,
            _validInputs,
            _funcSignature,
            _isSequence
        );
    }

    /* Public functions */
    function changeInputControl(address _newContract) external onlyOwner {
        i_InputControl = IInputControlModular(_newContract);
    }

    /**
     * @dev The following functions are here just for solving inheritance ambiguities in
     * inheritance tree.
     */

    function supportsInterface(
        bytes4 interfaceId
    ) public view override(ERC721URIStorage, ERC721Enumerable) returns (bool) {
        return super.supportsInterface(interfaceId);
    }

    function tokenURI(
        uint256 tokenId
    ) public view override(ERC721, ERC721URIStorage) returns (string memory) {
        return super.tokenURI(tokenId);
    }

    /* Internal functions */

    function _burn(
        uint256 tokenId
    ) internal override(ERC721, ERC721URIStorage) {
        super._burn(tokenId);
    }

    function _beforeTokenTransfer(
        address from,
        address to,
        uint256 firstTokenId,
        uint256 batchSize
    ) internal override(ERC721, ERC721Enumerable) {
        super._beforeTokenTransfer(from, to, firstTokenId, batchSize);
    }
}
