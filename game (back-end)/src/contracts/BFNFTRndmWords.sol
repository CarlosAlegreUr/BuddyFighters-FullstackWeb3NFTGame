// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@chainlink/contracts/src/v0.8/VRFConsumerBaseV2.sol";
import "@chainlink/contracts/src/v0.8/interfaces/VRFCoordinatorV2Interface.sol";
import "call-order-control-contract/CallOrderControl.sol";

// import "hardhat/console.sol";

/* Customed erros */
error BFNFT__Rndm__RndomNumLengthNotValid();
error BFNFT__Rndm__IsNotTokenOwner();
error BFNFT__Rndm__IsNotContractOnwer();

/**
 * @title BuddyFighters' NFTs Random Words.
 * @author Carlos Alegre Urquizú
 *
 * @notice This contract manages the random number generation fort the BuddyFighters collection.
 * For that it uses Chainlink VRF.
 */
contract BFNFTRndmWords is Ownable, VRFConsumerBaseV2, CallOrderControl {
    /* State variables */
    uint8 private constant MAX_PKMN_NUM = 151;
    uint8 private constant MAX_STATS_VALUE = 255;

    // Chainlink Random numbers generation
    uint8 private constant BLOCK_CONFIRMATION_FOR_RANDOMNESS = 3;
    VRFCoordinatorV2Interface private immutable i_vrfCoordinator;
    uint64 private immutable i_vrfSubsId;
    bytes32 private immutable i_keyHashGasLimit;
    uint32 private immutable i_callBackGasLimit;

    /* Events */
    event BFNFT__RndomWordsRequested(uint256 reqId);
    event BFNFT__RndomNumsGenerated(
        uint8[2] rndmNums,
        uint256 indexed requestId,
        address indexed callerAddress
    );
    event BFNFT__RndomStatsGenerated(
        uint8[6] rndmNums,
        uint256 indexed requestId,
        address indexed callerAddress
    );

    /* Modifiers */

    modifier checkAllowedCall(bytes4 _funcSelec, address _callerAddress) {
        if (msg.sender != this.owner()) {
            modifierHelperCallOrder(_funcSelec, _callerAddress);
        }
        _;
    }

    function modifierHelperCallOrder(
        bytes4 _funcSelec,
        address _callerAddress
    ) private isAllowedCall(_funcSelec, _callerAddress) returns (bool) {
        return false;
    }

    /* Functions */

    /**
     * @notice Runs on deploy.
     *
     * @dev Initializes the collection and makes it a Chainlink VRF consumer.
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
    function requestRandomNumbers(
        uint32 _numOfWords
    )
        external
        payable
        checkAllowedCall(
            bytes4(keccak256(bytes("requestRandomNumbers(uint32)"))),
            msg.sender
        )
    {
        if (_numOfWords == 2 || _numOfWords == 6) {
            uint256 requestId = i_vrfCoordinator.requestRandomWords(
                i_keyHashGasLimit,
                i_vrfSubsId,
                BLOCK_CONFIRMATION_FOR_RANDOMNESS,
                i_callBackGasLimit,
                _numOfWords
            );
            emit BFNFT__RndomWordsRequested(requestId);
        } else {
            revert BFNFT__Rndm__RndomNumLengthNotValid();
        }
    }

    /* Public functions */

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
            emit BFNFT__RndomNumsGenerated([num1, num2], requestId, msg.sender);
        } else {
            if (randomWords.length == 6) {
                uint8[6] memory stats;
                stats[0] = uint8((randomWords[0] % (MAX_STATS_VALUE)) + 1);
                stats[1] = uint8((randomWords[1] % (MAX_STATS_VALUE)) + 1);
                stats[2] = uint8((randomWords[2] % (MAX_STATS_VALUE)) + 1);
                stats[3] = uint8((randomWords[3] % (MAX_STATS_VALUE)) + 1);
                stats[4] = uint8((randomWords[4] % (MAX_STATS_VALUE)) + 1);
                stats[5] = uint8((randomWords[5] % (MAX_STATS_VALUE)) + 1);
                emit BFNFT__RndomStatsGenerated(stats, requestId, msg.sender);
            }
        }
    }

    function callAllowFuncCallsFor(
        address _callerAddress,
        bytes4[] calldata _validFuncCalls,
        bool _isSequence
    ) public override onlyOwner {
        allowFuncCallsFor(_callerAddress, _validFuncCalls, _isSequence);
    }
}
