// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@chainlink/contracts/src/v0.8/VRFConsumerBaseV2.sol";
import "@chainlink/contracts/src/v0.8/interfaces/VRFCoordinatorV2Interface.sol";
import "interaction-control-contract/InteractionControl.sol";

import "./Fight.sol";

/* Customed erros */
error BFNFT__MinimumPriceNotPayed();
error BFNFT__NotEnoughFunds();
error BFNFT__FailedToFundFight();
error BFNFT__RndomNumLengthNotValid();
error BFNFT__IsNotTokenOwner();

/**
 * @title BuddyFighters' NFTs contract.
 * @author Carlos Alegre Urquizú
 *
 * @notice This contract manages your nfts from BuddyFighters collection. It uses
 * InteractionControl contract to create "agreements" on which NFT's to minst and how
 * to upgrade them between costumer and the collection devs.
 */
contract BuddyFightersNFT is
    ERC721URIStorage,
    ERC721Enumerable,
    Ownable,
    InteractionControl,
    VRFConsumerBaseV2
{
    /* State variables */
    uint256 private constant MINT_PRICE = 10000000000000000;
    uint256 private constant STATS_CHANGE_PRICE = 10000000000000000;
    uint256 private constant START_FIGHT_COMMISSION = 10000000000000000;
    uint8 private constant MAX_PKMN_NUM = 151;
    uint8 private constant MAX_STATS_VALUE = 255;
    uint8 private constant STATS_NUM = 6;

    // Chainlink Random numbers generation
    uint8 private constant BLOCK_CONFIRMATION_FOR_RANDOMNESS = 3;
    VRFCoordinatorV2Interface private immutable i_vrfCoordinator;
    uint64 private immutable i_vrfSubsId;
    bytes32 private immutable i_keyHashGasLimit;
    uint32 private immutable i_callBackGasLimit;

    // Battle bids managing variables.
    mapping(address => uint256) private s_clientToFunds;

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
    event BFNFT__RndomNumsGenerated(
        uint8[2] rndmNums,
        uint256 indexed requestId
    );
    event BFNFT__RndomStatsGenerated(
        uint8[STATS_NUM] rndmNums,
        uint256 indexed requestId
    );
    event BFNFT__FightStarted(address indexed battleAddress);
    event BFNFT__WithdrawalResult(bool indexed success);

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
     * @dev Checks if client has deposited enough funds before executing the function.
     */
    modifier checkEnoughFunds(address _clientAddress, uint256 _price) {
        if (s_clientToFunds[_clientAddress] < _price) {
            revert BFNFT__NotEnoughFunds();
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
    ) ERC721(_name, _symbol) VRFConsumerBaseV2(_coordinatorAddress) {
        i_vrfCoordinator = VRFCoordinatorV2Interface(_coordinatorAddress);
        i_vrfSubsId = _vrfSubsId;
        i_keyHashGasLimit = _keyHashGasLimit;
        i_callBackGasLimit = _callBackGasLimit;
    }

    /**
     * Someone is sending us money. (:D)
     *
     * @dev Someone is sending us money. (:D)
     *
     * @notice If you wanna thank the devs team you can call this function
     * to send us a tip. (:D)
     */
    receive() external payable {
        s_clientToFunds[address(this)] += msg.value;
    }

    /**
     * Someone might be sending us money. (:D)
     *
     * @dev Someone might be sending us money. (:D)
     *
     * @notice If you wanna thank the devs team you can call this function with
     * some coin from the blockchain to send us a tip. (:D)
     */
    fallback() external payable {
        s_clientToFunds[address(this)] += msg.value;
    }

    /* External functions */

    /**
     * @dev Mints new token calling _safeMint(), new token's ID is totalSupply() and sets tokenURI with
     * _setTokenURI(). BaseURI is empty.
     *
     * @notice Client must call this function but first the interaction must me allowed by backend.
     */
    function mintNft(
        string memory _tokenURI
    )
        external
        payable
        minimumPricePayed(MINT_PRICE)
        isAllowedInteraction(
            bytes4(keccak256(bytes("mintNft(string)"))),
            msg.sender,
            keccak256(abi.encode(_tokenURI))
        )
    {
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
        isAllowedInteraction(
            bytes4(keccak256(bytes("changeStats(string,uint256)"))),
            msg.sender,
            keccak256(abi.encode(_newTokenURI, _tokenId))
        )
    {
        _setTokenURI(_tokenId, _newTokenURI);
        emit BFNFT__StatsChanged(msg.sender, _tokenId, _newTokenURI);
    }

    function useFundsToStartFight(
        address[2] calldata _participants,
        uint256[2] calldata _tokenIds
    )
        external
        payable
        onlyOwner
        checkEnoughFunds(_participants[0], START_FIGHT_COMMISSION)
        checkEnoughFunds(_participants[1], START_FIGHT_COMMISSION)
    {
        // Written like this so no there is no error: Stack too deep (:-|)
        address p1 = _participants[0];
        address p2 = _participants[1];
        uint256 tkn1 = _tokenIds[0];
        uint256 tkn2 = _tokenIds[1];

        Fight fightContract = new Fight(p1, p2, tkn1, tkn2, owner());

        (bool success, ) = payable(fightContract).call{value: msg.value}("");

        if (!success) {
            revert BFNFT__FailedToFundFight();
        }

        s_clientToFunds[p1] -= START_FIGHT_COMMISSION;
        s_clientToFunds[p2] -= START_FIGHT_COMMISSION;
        emit BFNFT__FightStarted(address(fightContract));
    }

    /**
     * @dev Request random numbers to Chainlink network via VRFCoordinator.
     * Backend calls this function and it requests to the VRFCoordinator to
     * get random numbers trhough Chainlink network. Number will be recieved
     * in function:
     *
     * `fulfillRandomWords(uint256 requestId, uint256[] memory randomWords) internal override`
     *
     * @param _numOfWords quantity of random numbers to generate.
     */
    function requestRandomNumbers(uint32 _numOfWords) external onlyOwner {
        i_vrfCoordinator.requestRandomWords(
            i_keyHashGasLimit,
            i_vrfSubsId,
            BLOCK_CONFIRMATION_FOR_RANDOMNESS,
            i_callBackGasLimit,
            _numOfWords
        );
    }

    /**
     * @dev Function to retire funds from contract in case of tips.
     */
    function withdrawContractBalance(
        address _accountToSendBalance
    ) external onlyOwner {
        (bool success, ) = _accountToSendBalance.call{
            value: address(this).balance
        }("");
        emit BFNFT__WithdrawalResult(success);
    }

    /* Public functions */

    /**
     *
     * @dev Gets balance of `_address`. Needed to start and deploy fights.
     *
     * @param _address is the client's address.
     */
    function getBalance(address _address) public view returns (uint256) {
        return s_clientToFunds[_address];
    }

    /**
     * @dev Overriden to mix it with Ownable
     *
     * See param specifications in allowfuncCallsFor() docs.
     */
    function callAllowInputsFor(
        address _callerAddress,
        bytes32[] calldata _validInputs,
        string calldata _funcSignature,
        bool _isSequence
    ) public override onlyOwner {
        allowInputsFor(
            _callerAddress,
            _validInputs,
            _funcSignature,
            _isSequence
        );
    }

    /**
     * @dev Overriden to mix it with Ownable
     *
     * See param specifications in allowfuncCallsFor() docs.
     */
    function callAllowFuncCallsFor(
        address _callerAddress,
        bytes4[] calldata _validFuncCalls,
        bool _isSequence
    ) public override onlyOwner {
        allowFuncCallsFor(_callerAddress, _validFuncCalls, _isSequence);
    }

    /**
     * @dev Chainlink coordinator returns random numbers requested.
     *
     * @notice Emits an event so client can see backend called this function on his token.
     *
     * @dev Override comes from VRFConsumerBaseV2. After `requestRandomNumbers(uint32 _numOfWords)`
     * has been called then i_vrfCoordinator proceeds request and calls this function.
     *
     * @param randomWords If pokemon numbers generated then length == 2, if stats generated
     * then length == 6.
     *
     * @param requestId Allows the client to indentify it's request and verify it was indeed proceed.
     */
    function fulfillRandomWords(
        uint256 requestId,
        uint256[] memory randomWords
    ) internal override {
        if (randomWords.length == 2) {
            uint8 num1 = uint8((randomWords[0] % MAX_PKMN_NUM) + 1);
            uint8 num2 = uint8((randomWords[1] % MAX_PKMN_NUM) + 1);
            emit BFNFT__RndomNumsGenerated([num1, num2], requestId);
        } else {
            if (randomWords.length == 6) {
                uint8[6] memory stats;
                stats[0] = uint8((randomWords[0] % (MAX_STATS_VALUE)) + 1);
                stats[1] = uint8((randomWords[1] % (MAX_STATS_VALUE)) + 1);
                stats[2] = uint8((randomWords[2] % (MAX_STATS_VALUE)) + 1);
                stats[3] = uint8((randomWords[3] % (MAX_STATS_VALUE)) + 1);
                stats[4] = uint8((randomWords[4] % (MAX_STATS_VALUE)) + 1);
                stats[5] = uint8((randomWords[5] % (MAX_STATS_VALUE)) + 1);
                emit BFNFT__RndomStatsGenerated(stats, requestId);
            } else {
                revert BFNFT__RndomNumLengthNotValid();
            }
        }
    }

    /**
     * @dev The following functions are here just for solving inheritance ambiguities in
     * inheritance tree.
     */

    function supportsInterface(
        bytes4 interfaceId
    ) public view override(ERC721, ERC721Enumerable) returns (bool) {
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
