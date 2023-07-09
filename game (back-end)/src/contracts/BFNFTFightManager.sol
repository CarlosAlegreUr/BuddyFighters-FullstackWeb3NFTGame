// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

import "@openzeppelin/contracts/access/Ownable.sol";
import "input-control-contract/modularVersion/IInputControlModular.sol";

// import "hardhat/console.sol";

/* Customed erros */
error BFNFT__FManager__NotPayedEnough();
error BFNFT__FManager__PlayerHasNoTitckets();
error BFNFT__FManager__PlayerIsNotInThisFight();
error BFNFT__FManager__FightIsNotActive();
error BFNFT__FManager__CantBetDuringFight();
error BFNFT__FManager__Only1FightAtATime();
error BFNFT__FManager__OwnerMusntCallStartFightToPreventAbuse();
error BFNFT__FManager__CollisionWith0ValueModifyABitTheInputAndTryAgain();
error BFNFT__FManager__NullAddressNotAllowed();
error BFNFT__FManager__FailedToSendFunds();
error BFNFT__FManager__NotAvailableFundsInContract();

/**
 * @title BuddyFighters' NFTs Fights Manager contract.
 * @author Carlos Alegre Urquizú
 *
 * @notice This contract manages the correct management of the fights.
 * From setting them to active to the correct bets setting and distribution or to the
 * purchase of fight tickets.
 *
 * @notice Due to the nature of the backend as a trusted third party to execute in a
 * cheap way the computations for the game logic, abuse of power or corruption
 * are a feasable scenario. Even with that clients have different ways of making sure
 * backend is doing what promises, so this is an incentive for the backend to behave.
 *
 * There exists a truly trustless solution but it's more expensive for players.
 * Changes required and detailedly explained on the README.md file:
 * ( https://github.com/CarlosAlegreUr/BuddyFighters-FullstackWeb3NFTGame/blob/finishingBackedLogic/README.md )
 *
 * How backend could abuse it's power is also better explained there.
 */
contract BFNFTFightsManager is Ownable {
    /* State variables */
    uint256 private constant TICKET_PRICE = 0.1 ether;
    uint256 private current_bets_value;

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
        address winner,
        uint256 prize
    );
    event BFNFT__FManager__FundsWithdrawn(uint256 quantity);
    event BFNFT__FManager__BetReturned(
        address indexed player,
        uint256 quantity
    );

    /* Modifiers */

    /**
     * @dev Checks if both players are in the same fight and if that fight is active.
     * Otherwise it reverts.
     */
    modifier validPlayersInValidFight(
        address[2] calldata _players,
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

    /**
     * @dev Checks if both players are not in a fight.
     * Otherwise it reverts.
     */
    modifier playersAreNotInBattle(address[2] calldata _players) {
        if (
            s_playerToOnGoingFight[_players[0]] != bytes32(0) ||
            s_playerToOnGoingFight[_players[1]] != bytes32(0)
        ) {
            revert BFNFT__FManager__Only1FightAtATime();
        }
        _;
    }

    /**
     * @dev Used to execute InputControl checking.
     */
    modifier checkAllowedInput(
        bytes4 _funcSelec,
        address _callerAddress,
        bytes32 _input
    ) {
        _;
        i_InputControl.isAllowedInput(_funcSelec, _callerAddress, _input);
    }

    /**
     * @dev Prohibits call to the owner.
     * It just makes the code a bit more anoying for corrupted owners.
     */
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
        if (fightId == bytes32(0)) {
            revert BFNFT__FManager__CollisionWith0ValueModifyABitTheInputAndTryAgain();
        }
    }

    /**
     * @dev Prevents sending funds to dead addresses.
     */
    modifier isNotNullAddress(address check) {
        if (check == address(0)) {
            revert BFNFT__FManager__NullAddressNotAllowed();
        }
        _;
    }

    /* Functions */

    /**
     * @dev Initializes InputControl contract
     * and sets to 0 the unavailable money quantity to withdraw.
     */
    constructor(address _inputControlContractAddress) {
        i_InputControl = IInputControlModular(_inputControlContractAddress);
        current_bets_value = 0;
    }

    /* External functions */

    /**
     * @dev Makes fight active in blockchain.
     * @notice Becareful if fightId ever collides with 0 value, if so tx will revert.
     *
     * @dev One of the participants will call this function. Both will have access.
     * It's designed in such a way that when one of them calls, if bets are set and both
     * players have tickes, the fight will be started  and the other player's permission
     * to call this func will be denied.
     *
     * If a player didnt send it's agreed bet, the bets of both players are returned to them
     * but the tickets from the players who didnt send the agreed bet are set to 0.
     * If any player doesnt have enough tickets tx reverts.
     *
     * @notice Front-end should take this into account when starting fights and if it's
     * reverted just check if he fightId is active to know if the opponent address called
     * this first.
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

        if (fightId == bytes32(0)) {
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
            bytes32[] memory empty = new bytes32[](0);
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
     * Anyway if backend is corrupted the affected client has means to realize and stop
     * using the services. So at least there is an incentive for backend to behave correctly.
     */
    function declareWinner(
        bytes32 _fightId,
        address _winner,
        address[2] calldata _players
    ) external onlyOwner isNotNullAddress(_winner) {
        // Get how much money to send.
        uint256 quantity = s_playerToLastBet[_players[0]] +
            s_playerToLastBet[_players[1]];

        // Reset fight and players' values
        resetFight(_players, _fightId);
        emit BFNFT__FManager__FightResult(_fightId, _winner, quantity);

        // Send money to the winner
        (bool success, ) = payable(_winner).call{value: quantity}("");
        if (!success) {
            revert BFNFT__FManager__FailedToSendFunds();
        }
    }

    /**
     * @dev Function to retire funds from contract.
     * Takes into account ongoing bets and can't withdraw that money.
     * Therefore only withdraws money spend on buying tickets.
     */
    function withdrawAllowedFunds() external onlyOwner {
        if (address(this).balance <= current_bets_value) {
            revert BFNFT__FManager__NotAvailableFundsInContract();
        }
        uint256 quantity = address(this).balance - current_bets_value;
        emit BFNFT__FManager__FundsWithdrawn(quantity);
        (bool success, ) = payable(this.owner()).call{value: quantity}("");
        if (!success) {
            revert BFNFT__FManager__FailedToSendFunds();
        }
    }

    /**
     * @dev Used to send bets to the contract, should be called by the client before starting a fight.
     *
     * @notice Only non battling players can update their bets.
     */
    function setBet() external payable {
        if (s_playerToOnGoingFight[msg.sender] == bytes32(0)) {
            s_playerToLastBet[msg.sender] = msg.value;
            current_bets_value += msg.value;
        } else {
            revert BFNFT__FManager__CantBetDuringFight();
        }
    }

    /**
     * @dev Clients must call this function with a high enough msg.value to recieve 1 ticket
     * at a time.
     *
     * With this money backend finances it's operations as referee.
     */
    function buyTicket() external payable {
        if (msg.value >= TICKET_PRICE) s_playerToTickects[msg.sender] += 1;
        else revert BFNFT__FManager__NotPayedEnough();
    }

    /**
     * @return Quantity of tickets that `_address` has.
     */
    function getTicketsOf(address _address) external view returns (uint256) {
        return s_playerToTickects[_address];
    }

    /**
     * @return Wheter a fight is active or not.
     */
    function getIsFightActive(bytes32 _fightId) external view returns (bool) {
        return s_figthIdIsActive[_fightId];
    }

    /**
     * @dev InputConrol function.
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

    /* Private functions */

    /**
     * @dev Resets all the values modified when fight was started.
     */
    function resetFight(
        address[2] calldata _players,
        bytes32 _fightId
    ) private validPlayersInValidFight(_players, _fightId) idIsNot0(_fightId) {
        delete s_figthIdIsActive[_fightId];

        current_bets_value -= s_playerToLastBet[_players[0]];
        current_bets_value -= s_playerToLastBet[_players[1]];

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
    function returnBets(
        address[2] calldata _players
    ) private isNotNullAddress(_players[0]) isNotNullAddress(_players[1]) {
        // Get how much each one bet.
        uint256 quantityP1 = s_playerToLastBet[_players[0]];
        uint256 quantityP2 = s_playerToLastBet[_players[1]];

        // Resets of values assosiated with last bet value
        current_bets_value -= s_playerToLastBet[_players[0]];
        current_bets_value -= s_playerToLastBet[_players[1]];

        // Deleted now to avoid any kind of reentrancy vulnerability.
        delete s_playerToLastBet[_players[0]];
        delete s_playerToLastBet[_players[1]];

        emit BFNFT__FManager__BetReturned(_players[0], quantityP1);
        emit BFNFT__FManager__BetReturned(_players[1], quantityP2);

        // Send the money.
        (bool success, ) = payable(_players[0]).call{value: quantityP1}("");
        if (!success) {
            revert BFNFT__FManager__FailedToSendFunds();
        }

        (bool success2, ) = payable(_players[1]).call{value: quantityP2}("");
        if (!success2) {
            revert BFNFT__FManager__FailedToSendFunds();
        }
    }

    /**
     * @dev Checks if both players have sent the bet's money.
     * If any hasn't, that one will lose all the fight tickets.
     */
    function checkBets(
        address[2] calldata _players,
        uint256[2] calldata _bets
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
