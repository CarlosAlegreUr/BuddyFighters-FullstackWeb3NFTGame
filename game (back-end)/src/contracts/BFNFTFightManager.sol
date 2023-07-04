// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

import "@openzeppelin/contracts/access/Ownable.sol";
import "input-control-contract/modularVersion/IInputControlModular.sol";

import "hardhat/console.sol";

/* Customed erros */
error BFNFT__FManager__PlayerHasNoTitckets();
error BFNFT__FManager__NotPayedEnough();
error BFNFT__FManager__PlayerIsNotInThisFight();
error BFNFT__FManager__FightIsNotActive();
error BFNFT__FManager__CantBetDuringFight();
error BFNFT__FManager__Only1FightAtATime();
error BFNFT__FManager__OwnerMusntCallStartFightToPreventAbuse();
error BFNFT__FManager__CollisionWith0ValueModifyABitTheInputAndTryAgain();
error BFNFT__FManager__CalledByOponentAlreadyDontWorry();
error BFNFT__FManager__FailedToSendFunds();
error BFNFT__FManager__NotAvailableFundsInContract();

/**
 * @title BuddyFighters' NFTs Fights Manager contract.
 * @author Carlos Alegre Urquizú
 *
 * @notice This contract is used by backend to manage the bets money and by clients
 * to buyt their tickets to start the fights and cover the backend expenses.
 *
 * @notice Due to the nature of the backend as a trusted third party to execute in a
 * cheap way the computations for the game logic, abuse of power or corruption
 * are a feasable scenario.
 *
 * There exists a truly trustless solution but it's more expensive for players.
 * Changes required and calculous costs are detailedly explained on the README.md file:
 * ( https://github.com/CarlosAlegreUr/BuddyFighters-FullstackWeb3NFTGame/blob/finishingBackedLogic/README.md )
 *
 * How backend could abuse it's power in the delcaring a winner part is also explained there. Despite this abuse
 * of power is easlily detectable by a client so backend has less incentives to behave badly and makes the system
 * more trustworthy.
 */
contract BFNFTFightsManager is Ownable {
    /* State variables */
    uint256 private constant TICKET_PRICE = 0.1 ether;
    uint256 private CURRENT_BETS_VALUE;

    // Battles' bets managing variables.
    mapping(address => uint8) private s_playerToTickects;
    mapping(bytes32 => bool) private s_figthIdIsActive;

    mapping(address => uint256) private s_playerToLastBet;
    mapping(address => bytes32) private s_playerToOnGoingFight;

    /* InputControl variables */
    IInputControlModular private i_InputControl;

    /* Events */
    event BFNFT__FManager__FightStarted(bytes32 indexed battleId);
    event BFNFT__FManager__FightResult(
        bytes32 indexed battleId,
        address winner
    );

    /* Modifiers */

    /**
     * @dev Checks if both players are in the same fight and if that fight is active.
     * Otherwise it reverts.
     */
    modifier validPlayersInValidFight(
        address[2] memory _players,
        bytes32 _fightId
    ) {
        if (
            !(_fightId == s_playerToOnGoingFight[_players[0]] &&
                _fightId == s_playerToOnGoingFight[_players[1]])
        ) {
            revert BFNFT__FManager__PlayerIsNotInThisFight();
        }
        if (!s_figthIdIsActive[_fightId]) {
            revert BFNFT__FManager__FightIsNotActive();
        }
        _;
    }

    modifier playersAreNotInBattle(address[2] memory _players) {
        if (
            s_playerToOnGoingFight[_players[0]] !=
            0x0000000000000000000000000000000000000000000000000000000000000000 ||
            s_playerToOnGoingFight[_players[1]] !=
            0x0000000000000000000000000000000000000000000000000000000000000000
        ) {
            revert BFNFT__FManager__Only1FightAtATime();
        }
        _;
    }

    /**
     * @dev InputControl function.
     * In this contract it's used to prevent Owner to destroy client's tickets.
     */
    modifier checkAllowedInput(
        bytes4 _funcSelec,
        address _callerAddress,
        bytes32 _input
    ) {
        i_InputControl.isAllowedInput(_funcSelec, _callerAddress, _input);
        _;
    }

    modifier preventOwner() {
        if (msg.sender == this.owner()) {
            revert BFNFT__FManager__OwnerMusntCallStartFightToPreventAbuse();
        }
        _;
    }

    /**
     * @dev Makes sure fightId with value 0 is never used because it's
     * used inside the contract for logic opearations as the empty value.
     *
     * It's used to check wheter a player is in a battle and prevents user
     * to bet while in battles. Users are not suposed to do this because they
     * would break the bets mechanics by changing the s_playerToLastBet variable.
     */
    modifier idIsNot0(bytes32 fightId) {
        _;
        if (
            fightId ==
            0x0000000000000000000000000000000000000000000000000000000000000000
        ) {
            revert BFNFT__FManager__CollisionWith0ValueModifyABitTheInputAndTryAgain();
        }
    }

    /* Functions */

    /**
     * @dev Initializes the quantity of money unavailable to withdraw to 0 and the InputControl contract.
     */
    constructor(address _inputControlContractAddress) {
        i_InputControl = IInputControlModular(_inputControlContractAddress);
        CURRENT_BETS_VALUE = 0;
    }

    /* External functions */

    /**
     * @dev Makes fight active in blockchain.
     * @notice Becareful if fightId ever collides with 0 value, backend should take charge of no
     * collisions before calling this contract!!
     *
     * @dev One of the participants will call this function. Both will have access.
     * It's designed in sucha a way that when one of them calls it the fight is started
     * and if the other one calls it again then it just reverts and informs that fight
     * has already started.
     *
     * @param _players Both players participating in a fight.
     *
     * @param _tokenIds The token ID of the NFTs that will be used in the fight.
     *
     * @param _bets The bets players suposedly have placed.
     * @notice It will be checked in by the modifier checkBets().
     * @notice Ticket quantity checking is also done by the smart contract.
     */
    function startFight(
        address[2] calldata _players,
        uint256[2] calldata _tokenIds,
        uint256[2] calldata _bets
    )
        external
        preventOwner
        playersAreNotInBattle(_players)
        checkAllowedInput(
            bytes4(
                keccak256(bytes("startFight(address[2],uint256[2],uint256[2])"))
            ),
            msg.sender,
            keccak256(abi.encode(_players, _tokenIds, _bets))
        )
    {
        bytes32 fightId = keccak256(
            abi.encode(_players[0], _players[1], _tokenIds[0], _tokenIds[1])
        );

        if (
            fightId ==
            0x0000000000000000000000000000000000000000000000000000000000000000
        ) {
            revert BFNFT__FManager__CollisionWith0ValueModifyABitTheInputAndTryAgain();
        }

        // Check Bets returns false if anything is wrong
        if (checkBets(_players, _bets)) {
            if (!s_figthIdIsActive[fightId]) {
                if (
                    s_playerToTickects[_players[0]] == 0 ||
                    s_playerToTickects[_players[1]] == 0
                ) {
                    revert BFNFT__FManager__PlayerHasNoTitckets();
                }

                s_figthIdIsActive[fightId] = true;
                if (s_playerToTickects[_players[0]] >= 1) {
                    s_playerToTickects[_players[0]] -= 1;
                }
                if (s_playerToTickects[_players[1]] >= 1) {
                    s_playerToTickects[_players[1]] -= 1;
                }
                s_playerToOnGoingFight[_players[0]] = fightId;
                s_playerToOnGoingFight[_players[1]] = fightId;
                emit BFNFT__FManager__FightStarted(fightId);
            }
        } else {
            returnBets(_players);
            // Deny access to prevent other player to force you
            // lose all your tickets. The only way they could is if
            // backend cooperated.
            address denyAccessPlayer = _players[1];
            if (_players[1] == msg.sender) denyAccessPlayer = _players[0];
            bytes32[] memory empty;
            i_InputControl.allowInputsFor(
                denyAccessPlayer,
                empty,
                "startFight(address[2],uint256[2],uint256[2])",
                false
            );
        }
    }

    /**
     * @dev Declares a winner for a fightId and resets the values after.
     * @notice Here is where backend can get bribed to act maliciously.
     * Anyway if backend does that the affected client would realize immediately and stop
     * using the services.
     */
    function declareWinner(
        bytes32 _fightId,
        address _winner,
        address[2] calldata _players
    ) external onlyOwner {
        // Get how much money to send.
        uint256 quantity = s_playerToLastBet[_players[0]] +
            s_playerToLastBet[_players[1]];

        // Send money to the winner
        (bool success, ) = payable(_winner).call{value: quantity}("");
        if (!success) {
            revert BFNFT__FManager__FailedToSendFunds();
        }

        // Reset fight and players' values
        resetFight(_players, _fightId);

        emit BFNFT__FManager__FightResult(_fightId, _winner);
    }

    /**
     * @dev Function to retire funds from contract.
     * Takes into account ongoing bets and can't withdraw that money.
     * Therefore only withdraws money spend on buying tickets.
     */
    function withdrawAllowedFunds(address _sendTo) external onlyOwner {
        if (
            address(this).balance == 0 ||
            address(this).balance < CURRENT_BETS_VALUE
        ) {
            revert BFNFT__FManager__NotAvailableFundsInContract();
        }
        uint256 quantity = address(this).balance - CURRENT_BETS_VALUE;
        (bool success, ) = payable(_sendTo).call{value: quantity}("");
        if (!success) {
            revert BFNFT__FManager__FailedToSendFunds();
        }
    }

    /**
     * @dev InputConrol function.
     * @notice It's been a bit modified to prevent tickets control from Owner.
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

    /* Public functions */

    /**
     * @dev Clients must call this function with the correct msg.value to recieve 1 ticket
     * at a time.
     *
     * With this money backend finances it's operations as referee.
     */
    function buyTicket() public payable {
        if (msg.value >= TICKET_PRICE) s_playerToTickects[msg.sender] += 1;
        else revert BFNFT__FManager__NotPayedEnough();
    }

    /**
     * @dev Used to send bets to the contract, should be called by the client before starting a fight.
     *
     * @notice Only non battling players can update their bets.
     */
    function setBet() public payable {
        if (
            s_playerToOnGoingFight[msg.sender] ==
            0x0000000000000000000000000000000000000000000000000000000000000000
        ) {
            s_playerToLastBet[msg.sender] = msg.value;
            CURRENT_BETS_VALUE += msg.value;
        } else {
            revert BFNFT__FManager__CantBetDuringFight();
        }
    }

    /**
     * @return Quantity of tickets that `_address` has.
     */
    function getTicketsOf(address _address) public view returns (uint256) {
        return s_playerToTickects[_address];
    }

    /**
     * @return Wheter a fight is active or not.
     */
    function getIsFightActive(bytes32 _fightId) public view returns (bool) {
        return s_figthIdIsActive[_fightId];
    }

    /* Private functions */

    /**
     * @dev Resets all the values modified when a fight is started to the values
     * they should have when fights are declared finished.
     */
    function resetFight(
        address[2] memory _players,
        bytes32 _fightId
    ) private validPlayersInValidFight(_players, _fightId) idIsNot0(_fightId) {
        delete s_figthIdIsActive[_fightId];
        CURRENT_BETS_VALUE -= s_playerToLastBet[_players[0]];
        CURRENT_BETS_VALUE -= s_playerToLastBet[_players[1]];
        delete s_playerToLastBet[_players[0]];
        delete s_playerToLastBet[_players[1]];
        delete s_playerToOnGoingFight[_players[0]];
        delete s_playerToOnGoingFight[_players[1]];
    }

    /**
     * @dev In case a player doesn't place their bet. This function is called to return
     * every player it's deposited bet.
     *
     * @param _players Both players participating in a fight.
     */
    function returnBets(address[2] calldata _players) private {
        // Get how much each one bet.
        uint256 quantityP1 = s_playerToLastBet[_players[0]];
        uint256 quantityP2 = s_playerToLastBet[_players[1]];

        // Send the money.
        (bool success, ) = payable(_players[0]).call{value: quantityP1}("");
        if (!success) {
            revert BFNFT__FManager__FailedToSendFunds();
        }

        (bool success2, ) = payable(_players[1]).call{value: quantityP2}("");
        if (!success2) {
            revert BFNFT__FManager__FailedToSendFunds();
        }

        CURRENT_BETS_VALUE -= s_playerToLastBet[_players[0]];
        CURRENT_BETS_VALUE -= s_playerToLastBet[_players[1]];
        delete s_playerToLastBet[_players[0]];
        delete s_playerToLastBet[_players[1]];
    }

    /**
     * @dev Checks if both players have sent the bet's money.
     * If any hasn't, that one will lose all the fight tickets.
     */
    function checkBets(
        address[2] memory _players,
        uint256[2] memory _bets
    ) private returns (bool) {
        bool betsChecker = true;
        if (s_playerToLastBet[_players[0]] < _bets[0]) {
            delete s_playerToTickects[_players[0]];
            betsChecker = false;
        }
        if (s_playerToLastBet[_players[1]] < _bets[1]) {
            delete s_playerToTickects[_players[1]];
            betsChecker = false;
        }
        return betsChecker;
    }
}
