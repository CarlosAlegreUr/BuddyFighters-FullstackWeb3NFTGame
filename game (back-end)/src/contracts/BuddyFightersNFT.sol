// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "input-control-contract/modularVersion/IInputControlModular.sol";

/* Customed erros */
error BFNFT__NotPayedEnough();
error BFNFT__YouHaveNoTcikets();
error BFNFT__YouAreNotTokenOwner();
error BFNFT__FailedToSendFunds();

/**
 * @title BuddyFighters' NFTs contract.
 * @author Carlos Alegre Urquizú
 *
 * @notice This contract manages your Nfts from BuddyFighters collection. It uses
 * InteractionControl contract to create "agreements" between costumer and the collection devs
 * on how to upgrade their NFTs.
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
    event BFNFT__MoneySent(uint256 quantity);

    /**
     * @dev Checks if caller has more than 0 tickets, if it does it decreases them by 1.
     * If caller is onwer nothing is done.
     */
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
     * @dev Checks if `_tokenOwner` address owns token with `_tokenId`.
     * If not reverts with customed error.
     */
    modifier isTokenOwner(uint256 _tokenId) {
        if (ownerOf(_tokenId) != msg.sender) {
            revert BFNFT__YouAreNotTokenOwner();
        }
        _;
    }

    /**
     * @dev Controls inputs.
     * Owner has total uncontroled input calls. Doen't affect the agreement
     * because if Owner doesn't own NFT he won't be able to call any function
     * that affects the NFT's URI.
     */
    modifier checkAllowedInput(
        bytes4 _funcSelec,
        address _callerAddress,
        bytes32 _input
    ) {
        _;
        if (msg.sender != this.owner()) {
            i_InputControl.isAllowedInput(_funcSelec, _callerAddress, _input);
        }
    }

    /* Functions */

    constructor(
        string memory _collectionName,
        string memory _collectionSymbol,
        address _inputControlContractAddress
    ) ERC721(_collectionName, _collectionSymbol) {
        i_InputControl = IInputControlModular(_inputControlContractAddress);
    }

    /* External functions */

    /**
     * @dev Mints new token calling _safeMint(), new token's ID is totalSupply().
     */
    function mintNft(string calldata _tokenURI) external payable onlyOwner {
        uint256 tokenId = totalSupply();
        _safeMint(msg.sender, tokenId);
        _setTokenURI(tokenId, _tokenURI);
        emit BFNFT__NftMinted(msg.sender, tokenId, _tokenURI);
    }

    /**
     * @dev Changes stats of NFT changing it's URI.
     *
     * @notice Client must call this function but first the interaction must me allowed by backend.
     * Client request change to backend, backend sends back an URI and if client likes the changes
     * they can call this function with the allowed URI backend gave them. Therefore creating an
     * agreement.
     *
     * @param _newTokenURI is URI pointing to JSON metadata on IPFS or on-chain
     * metadata in JSON format encoded in base64.
     */
    function changeStats(
        string calldata _newTokenURI,
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

    /**
     * @dev Allows backend to give permissions to clients.
     */
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

    /**
     * @dev Withdraws funds gathered from change stat tickets sold..
     */
    function withdrawFunds() external onlyOwner {
        emit BFNFT__MoneySent(address(this).balance);
        (bool success, ) = payable(this.owner()).call{
            value: address(this).balance
        }("");
        if (!success) {
            revert BFNFT__FailedToSendFunds();
        }
    }

    /**
     * @dev Clients call this to buy tickets.
     * 1 at a time and money sent myst be higher or equal to the price.
     */
    function buyTicket() external payable {
        if (msg.value >= TICKET_PRICE) s_clientToTickects[msg.sender] += 1;
        else revert BFNFT__NotPayedEnough();
    }

    /**
     * @return Num of tickets that `_address` has.
     */
    function getTicketsOf(address _address) external view returns (uint256) {
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
