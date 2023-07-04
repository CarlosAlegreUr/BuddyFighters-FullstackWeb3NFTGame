// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "input-control-contract/modularVersion/IInputControlModular.sol";

/* Customed erros */
error BFNFT__YouAreNotTokenOwner();
error BFNFT__IsNotContractOnwer();
error BFNFT__YouHaveNoTcikets();
error BFNFT__NotPayedEnough();

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
    IInputControlModular private i_InputControl;

    mapping(address => uint256) s_clientToTickects;
    uint256 private constant TICKET_PRICE = 0.1 ether;

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

    modifier hasTickets() {
        if (s_clientToTickects[msg.sender] == 0 && msg.sender != this.owner()) {
            revert BFNFT__YouHaveNoTcikets();
        }
        if (msg.sender != this.owner()) {
            s_clientToTickects[msg.sender] -= 1;
        }
        _;
    }

    /**
     * Checking if an address is owner of a token.
     *
     * @dev Checks if `_tokenOwner` address owns token with `_tokenId`.
     * If not reverts with customed error.
     */
    modifier isTokenOwner(uint256 _tokenId) {
        if (ownerOf(_tokenId) != msg.sender) {
            revert BFNFT__YouAreNotTokenOwner();
        }
        _;
    }

    modifier checkAllowedInput(
        bytes4 _funcSelec,
        address _callerAddress,
        bytes32 _input
    ) {
        if (msg.sender != this.owner()) {
            i_InputControl.isAllowedInput(_funcSelec, _callerAddress, _input);
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
    function mintNft(string memory _tokenURI) external payable onlyOwner {
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
        isTokenOwner(_tokenId)
        hasTickets
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
    function buyTicket() public payable {
        if (msg.value >= TICKET_PRICE) s_clientToTickects[msg.sender] += 1;
        else revert BFNFT__NotPayedEnough();
    }

    function getTicketsOf(address _address) public view returns (uint256) {
        return s_clientToTickects[_address];
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
