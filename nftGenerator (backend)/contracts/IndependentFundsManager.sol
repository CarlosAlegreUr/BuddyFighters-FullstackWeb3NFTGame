// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@chainlink/contracts/src/v0.8/VRFConsumerBaseV2.sol";
import "@chainlink/contracts/src/v0.8/interfaces/VRFCoordinatorV2Interface.sol";
import "./BuddyFightersNFT.sol";
import "./Fight.sol";

import "hardhat/console.sol";

/* Customed erros */
error IndependentFundsManager__BDFT__LockerLockedForever();
error IndependentFundsManager__BDFT__NotEnoughBalance();
error IndependentFundsManager__BDFT__MinimumPriceNotPayed();
error IndependentFundsManager__BDFT__NotEnoughFunds();
error IndependentFundsManager__BDFT__FailedToWithdraw();
error IndependentFundsManager__BDFT__NoFundsFound();
error IndependentFundsManager__BDFT__ClientFundsAreFrozen();
error IndependentFundsManager__BDFT__ClientPermissionDenied();
error IndependentFundsManager__BDFT__MustCallCollectionAddress();
error IndependentFundsManager__BDFT__MintingFailed();
error IndependentFundsManager__BDFT__ChangeStatsFailed();
error IndependentFundsManager__BDFT__FailedToFundFight();

/**
 * @title IndependentSubsFunder.sol.
 * @author Carlos Alegre Urquizú
 *
 * @notice Notice this contract has no withdrawal functions so the money sent here
 * can't be taken by devs if they get corrupted. This contract manages the funding
 * of Chainlink subscriptions in their contracts which BuddyFighters NFT collection
 * uses and also manages the funds to create fights or change stats in the web game.
 * Notice only backend can call the contract but it won't call functions if you haven't
 * sent the coins there.
 *
 * @dev No withdrawal function are implemented to this contract so no-one can use the
 * funds. Only backend addresses by devs team can call some functions of the contract.
 * Though events are emitted so end user can check backend does what promises.
 */
contract IndependentFundsManager is VRFConsumerBaseV2, Ownable {
    /* Special Types */
    enum PermissionFor {
        noPermission, //0
        mintNft, // 1
        changeStats, // 2
        startFight // 3
    }

    /* State variables */
    uint256 private constant MINT_PRICE = 10000000000000000;
    uint256 private constant STATS_CHANGE_PRICE = 10000000000000000;
    uint256 private constant START_FIGHT_COMMISSION = 10000000000000000;
    uint8 private constant MAX_PKMN_NUM = 150;
    uint8 private constant MAX_STATS_VALUE = 254;
    uint8 private constant STATS_NUM = 6;

    bool s_activeLocker;
    address payable private s_collectionAddress;

    // Chainlink Random numbers generation
    uint8 private constant BLOCK_CONFIRMATION_FOR_RANDOMNESS = 3;
    VRFCoordinatorV2Interface private immutable i_vrfCoordinator;
    uint64 private immutable i_vrfSubsId;
    bytes32 private immutable i_keyHashGasLimit;
    uint32 private immutable i_callBackGasLimit;

    mapping(address => uint256) private s_clientToFunds;
    // Mutex to prevent devs from stealing funds or mismanage them.
    mapping(address => bool) private s_clientToAreFundsFrozen;
    mapping(address => PermissionFor) private s_clientToPermision;

    /* Events */
    event IndependentFundsManager__BDFT__RndomNumsGenerated(
        uint8[2] indexed rndmNums,
        uint256 indexed requestId
    );
    event IndependentFundsManager__BDFT__RndomStatsGenerated(
        uint8[STATS_NUM] indexed rndmNums,
        uint256 indexed requestId
    );
    event IndependentFundsManager__BDFT__FightStarted(
        address indexed battleAddress
    );
    event IndependentFundsManager__BDFT__ChangeStatsCalled(
        string indexed newTokenUri,
        address indexed clientAddress
    );
    event IndependentFundsManager__BDFT__MintingCalled(
        string indexed tokenUri,
        address indexed clientAddress
    );

    /* Modifiers */

    modifier checkHasFunds(address _clientAddress) {
        if (s_clientToFunds[_clientAddress] == 0) {
            revert IndependentFundsManager__BDFT__NoFundsFound();
        }
        _;
    }

    /**
     * Enough funds modifier.
     *
     * @dev Checks if client has deposited enough funds to proceed with the function.
     */
    modifier checkEnoughFunds(address _clientAddress, uint256 _price) {
        if (s_clientToFunds[_clientAddress] < _price) {
            revert IndependentFundsManager__BDFT__NotEnoughFunds();
        }
        _;
    }

    modifier checkFrozenFunds(address _clientAddress) {
        if (s_clientToAreFundsFrozen[_clientAddress] == true) {
            revert IndependentFundsManager__BDFT__ClientFundsAreFrozen();
        }
        _;
    }

    modifier checkPermission(address _clienAddress, PermissionFor _permission) {
        if (s_clientToPermision[_clienAddress] != _permission) {
            revert IndependentFundsManager__BDFT__ClientPermissionDenied();
        }
        _;
    }

    /**
     * Minimum price modifier.
     *
     * @dev Sets minimum price in ETH (or blockchain coin) for msg.value
     * for function to be executed. If not reverts with customed error.
     */
    modifier minimumPricePayed(uint256 _price) {
        if (msg.value < _price) {
            revert IndependentFundsManager__BDFT__MinimumPriceNotPayed();
        }
        _;
    }

    /* Functions */

    // TODO: use LINK token to fund subscriptions in testnets.

    /**
     * Runs on deploy.
     *
     * @dev Initializes and makes this contract a Chainlink VRF consumer.
     *
     * See Chainlink VRF docs for more info on arguments required.
     */
    constructor(
        address _coordinatorAddress,
        uint64 _vrfSubsId,
        bytes32 _keyHashGasLimit,
        uint32 _callBackGasLimit
    ) VRFConsumerBaseV2(_coordinatorAddress) {
        s_activeLocker = false;
        i_vrfCoordinator = VRFCoordinatorV2Interface(_coordinatorAddress);
        i_vrfSubsId = _vrfSubsId;
        i_keyHashGasLimit = _keyHashGasLimit;
        i_callBackGasLimit = _callBackGasLimit;
    }

    receive() external payable {
        s_clientToFunds[s_collectionAddress] += msg.value;
    }

    fallback() external payable {
        s_clientToFunds[s_collectionAddress] += msg.value;
    }

    /* External functions */

    function setCollectionAddress(
        address payable _collection
    ) external onlyOwner {
        if (s_activeLocker == false) {
            s_collectionAddress = _collection;
            s_activeLocker = true;
        } else {
            revert IndependentFundsManager__BDFT__LockerLockedForever();
        }
    }

    function fund() external payable {
        s_clientToFunds[msg.sender] += msg.value;
    }

    function withdrawFunds(
        uint256 _quantity
    ) external checkEnoughFunds(msg.sender, _quantity) {
        s_clientToFunds[msg.sender] -= _quantity;
        (bool success, ) = payable(msg.sender).call{value: _quantity}("");
        if (!success) {
            revert IndependentFundsManager__BDFT__FailedToWithdraw();
        }
    }

    function setFrozenFunds(bool _frozen) external checkHasFunds(msg.sender) {
        s_clientToAreFundsFrozen[msg.sender] = _frozen;
    }

    function setPermission(
        PermissionFor _permission
    ) external checkHasFunds(msg.sender) {
        s_clientToPermision[msg.sender] = _permission;
    }

    function useFundsToMintNft(
        string memory _tokenURI,
        address _clientAddress
    )
        external
        payable
        onlyOwner
        checkEnoughFunds(_clientAddress, MINT_PRICE)
        checkFrozenFunds(_clientAddress)
        checkPermission(_clientAddress, PermissionFor(1))
        minimumPricePayed(MINT_PRICE)
    {
        s_clientToFunds[_clientAddress] -= MINT_PRICE;
        (bool success, ) = s_collectionAddress.call{value: MINT_PRICE}(
            abi.encodeWithSignature(
                "mintNft(string,address)",
                _tokenURI,
                _clientAddress
            )
        );
        if (!success) {
            revert IndependentFundsManager__BDFT__ChangeStatsFailed();
        }
        emit IndependentFundsManager__BDFT__MintingCalled(
            _tokenURI,
            _clientAddress
        );
        s_clientToAreFundsFrozen[_clientAddress] = true;
    }

    function useFundsToChangeStats(
        string memory _newTokenURI,
        address _tokenOwner,
        uint256 _tokenId
    )
        external
        payable
        onlyOwner
        checkEnoughFunds(_tokenOwner, STATS_CHANGE_PRICE)
        checkFrozenFunds(_tokenOwner)
        checkPermission(_tokenOwner, PermissionFor(2))
        minimumPricePayed(STATS_CHANGE_PRICE)
    {
        s_clientToFunds[_tokenOwner] -= STATS_CHANGE_PRICE;
        (bool success, ) = s_collectionAddress.call{value: STATS_CHANGE_PRICE}(
            abi.encodeWithSignature(
                "changeStats(string,address,uint256)",
                _newTokenURI,
                _tokenOwner,
                _tokenId
            )
        );
        if (!success) {
            revert IndependentFundsManager__BDFT__ChangeStatsFailed();
        }
        emit IndependentFundsManager__BDFT__ChangeStatsCalled(
            _newTokenURI,
            _tokenOwner
        );
        s_clientToAreFundsFrozen[_tokenOwner] = true;
    }

    function useFundsToStartFight(
        address[2] memory _participants,
        uint256[2] memory _tokenIds
    )
        external
        payable
        onlyOwner
        checkEnoughFunds(_participants[0], START_FIGHT_COMMISSION)
        checkEnoughFunds(_participants[1], START_FIGHT_COMMISSION)
        checkFrozenFunds(_participants[0])
        checkFrozenFunds(_participants[1])
        checkPermission(_participants[0], PermissionFor(3))
        checkPermission(_participants[1], PermissionFor(3))
    {
        // Written like this so no there is no error: Stack too deep (:-|)
        address p1 = _participants[0];
        address p2 = _participants[1];
        uint256 tkn1 = _tokenIds[0];
        uint256 tkn2 = _tokenIds[1];

        Fight fightContract = new Fight(
            p1,
            p2,
            tkn1,
            tkn2,
            owner()
        );

        (bool success, ) = payable(fightContract).call{
            value: msg.value
        }("");

        if (!success) {
            revert IndependentFundsManager__BDFT__FailedToFundFight();
        }

        s_clientToFunds[p1] -= START_FIGHT_COMMISSION;
        s_clientToFunds[p2] -= START_FIGHT_COMMISSION;
        s_clientToAreFundsFrozen[p1] = true;
        s_clientToAreFundsFrozen[p2] = true;
        emit IndependentFundsManager__BDFT__FightStarted(
            address(fightContract)
        );
    }

    /**
     * Request random numbers to Chainlink network via VRFCoordinator.
     *
     * @dev Backend calls this function and it requests to the VRFCoordinator
     * to get random numbers trhough Chainlink network. Number will be recieved in function:
     * ` fulfillRandomWords(uint256 requestId, uint256[] memory randomWords) internal override`
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

    /* Public functions */

    function getBalance(address _address) public view returns (uint256) {
        return s_clientToFunds[_address];
    }

    /* Internal functions */

    /**
     * Chainlink coordinator returns random numbers requested.
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
            uint8 num1 = uint8((randomWords[0] % (MAX_PKMN_NUM)) + 1);
            uint8 num2 = uint8((randomWords[1] % (MAX_PKMN_NUM)) + 1);
            emit IndependentFundsManager__BDFT__RndomNumsGenerated(
                [num1, num2],
                requestId
            );
            console.log("%s -------------------- %s", num1, num2);
        } else {
            uint8[6] memory stats;
            stats[0] = uint8((randomWords[0] % (MAX_STATS_VALUE)) + 1);
            stats[1] = uint8((randomWords[1] % (MAX_STATS_VALUE)) + 1);
            stats[2] = uint8((randomWords[2] % (MAX_STATS_VALUE)) + 1);
            stats[3] = uint8((randomWords[3] % (MAX_STATS_VALUE)) + 1);
            stats[4] = uint8((randomWords[4] % (MAX_STATS_VALUE)) + 1);
            stats[5] = uint8((randomWords[5] % (MAX_STATS_VALUE)) + 1);
            emit IndependentFundsManager__BDFT__RndomStatsGenerated(
                stats,
                requestId
            );
        }
    }
}
