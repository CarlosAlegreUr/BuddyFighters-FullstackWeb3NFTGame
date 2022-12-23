// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@chainlink/contracts/src/v0.8/VRFConsumerBaseV2.sol";
import "@chainlink/contracts/src/v0.8/interfaces/VRFCoordinatorV2Interface.sol";
import "./BuddyFightersNFT.sol";

/* Customed erros */
error IndependentFundsManager__NotEnoughFunds();

/**
 * @title IndependentSubsFunder.sol.
 * @author Carlos Alegre Urquizú
 *
 * @notice Notice this contract has no withdrawal functions so the money sent here
 * can't be taken by devs if they get corrupted. This contract manages the funding
 * of Chainlink subscriptions in their contracts which BuddyFighters NFT collection
 * uses and also manages the funds to create fights in the web game.
 *
 * @dev No withdrawal function are implemented to this contract so no-one can use the
 * funds. Only backend addresses by devs team can call some functions of the contract.
 * Though events are emitted so end user can check backend does what promises.
 */
contract IndependentFundsManager is VRFConsumerBaseV2, Ownable {
    /* State variables */
    uint256 private constant MINIMUM_STATS_CHANGE_PRICE = 10000000000000;
    uint8 private constant MAX_PKMN_NUM = 150;
    uint8 private constant MAX_STATS_VALUE = 254;
    uint8 private constant STATS_NUM = 6;

    // Chainlink Random numbers generation
    uint8 private constant BLOCK_CONFIRMATION_FOR_RANDOMNESS = 3;
    VRFCoordinatorV2Interface private immutable i_vrfCoordinator;
    uint64 private immutable i_vrfSubsId;
    bytes32 private immutable i_keyHashGasLimit;
    uint32 private immutable i_callBackGasLimit;

    /* Events */
    event IndependentFundsManager__BDFT__RndomNumsGenerated(
        uint8[2] indexed rndmNums,
        uint256 indexed requestId
    );
    event IndependentFundsManager__BDFT__RndomStatsGenerated(
        uint8[STATS_NUM] indexed rndmNums,
        uint256 indexed requestId
    );

    /* Modifiers */

    /**
     * Enough funds modifier.
     *
     * @dev Checks if funds are enough to proceed function.
     */
    modifier checkEnoughFunds(uint256 _price) {
        if (address(this).balance < _price) {
            revert IndependentFundsManager__NotEnoughFunds();
        }
        _;
    }

    /* Functions */

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
        i_vrfCoordinator = VRFCoordinatorV2Interface(_coordinatorAddress);
        i_vrfSubsId = _vrfSubsId;
        i_keyHashGasLimit = _keyHashGasLimit;
        i_callBackGasLimit = _callBackGasLimit;
    }

    /* External functions */

    function useFundsToChangeStats(
        address _nftCollectionAddress,
        string memory _newTokenURI,
        address _tokenOwner,
        uint256 _tokenId
    ) external checkEnoughFunds(MINIMUM_STATS_CHANGE_PRICE) onlyOwner returns (bool) {
        // TODO abi.encode
        // use call
        (bool success, ) = _nftCollectionAddress.call{
            value: MINIMUM_STATS_CHANGE_PRICE
        }("");
        return success;
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

    // TODO: Fight deployment
}
