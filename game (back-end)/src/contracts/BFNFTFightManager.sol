// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

import "@openzeppelin/contracts/access/Ownable.sol";

/* Customed erros */
error BFNFT__FManager__PlayerHasNoTitckets();
error BFNFT__FManager__NotPayedEnough();
error BFNFT__FManager__WinnerIsNotPlayer();
error BFNFT__FManager__BetsNotSent();
error BFNFT__FManager__FailedToSendFunds();
error BFNFT__FManager__NotAvailableFundsInContract();

/**
 * @title BuddyFighters' NFTs Fights Manager contract.
 * @author Carlos Alegre Urquizú
 *
 * @notice This contract manages the deployment of fights with
 * nfts from BuddyFighters collection.
 */
contract BFNFTFightsManager is Ownable {
    /* State variables */
    uint256 private constant TICKET_PRICE = 10000000000000000;
    uint256 private CURRENT_BETS_VALUE;

    // Battle bets managing variables.
    mapping(address => uint8) private s_playerToTickects;

    mapping(bytes32 => bool) private s_figthIdisActive;
    mapping(address => uint256) private s_playerToLastBet;

    mapping(address => bool) s_hasOnGoingFight;

    /* Events */
    event BFNFT__FManager__FightStarted(bytes32 indexed battleId);
    event BFNFT__FManager__FightResult(
        bytes32 indexed battleId,
        address indexed winner
    );

    /* Modifiers */
    modifier checkTickets(address[2] memory _players) {
        if (
            s_playerToTickects[_players[0]] == 0 ||
            s_playerToTickects[_players[1]] == 0
        ) {
            revert BFNFT__FManager__PlayerHasNoTitckets();
        }
        _;
    }

    modifier checkBets(address[2] memory _players, uint256[2] memory _bets) {
        if (
            _bets[0] < s_playerToLastBet[_players[0]] ||
            _bets[1] < s_playerToLastBet[_players[1]]
        ) revert BFNFT__FManager__BetsNotSent();
        _;
    }

    modifier winnerIsPlayer(address _winner, address[2] memory _players) {
        if (_winner != _players[0] && _winner != _players[1]) {
            revert BFNFT__FManager__WinnerIsNotPlayer();
        }
        _;
    }

    /* Functions */

    constructor() {
        CURRENT_BETS_VALUE = 0;
    }

    /**
     * @dev Used to send bets to the contract.
     */
    receive() external payable {
        if (!s_hasOnGoingFight[msg.sender])
            s_playerToLastBet[msg.sender] = msg.value;
    }

    /* External functions */

    function startFight(
        address[2] calldata _players,
        uint256[2] calldata _tokenIds,
        uint256[2] calldata _bets
    ) external onlyOwner checkTickets(_players) checkBets(_players, _bets) {
        bytes32 fightId = keccak256(
            abi.encode(_players[0], _players[1], _tokenIds[0], _tokenIds[1])
        );
        s_figthIdisActive[fightId] = true;
        s_playerToTickects[_players[0]] -= 1;
        s_playerToTickects[_players[1]] -= 1;
        CURRENT_BETS_VALUE += s_playerToLastBet[_players[0]];
        CURRENT_BETS_VALUE += s_playerToLastBet[_players[1]];
        s_hasOnGoingFight[_players[0]] = true;
        s_hasOnGoingFight[_players[1]] = true;
        emit BFNFT__FManager__FightStarted(fightId);
    }

    function declareWinner(
        bytes32 _fightId,
        address _winner,
        address[2] calldata _players
    ) external onlyOwner winnerIsPlayer(_winner, _players) {
        // Send money to the winner
        uint256 quantity = s_playerToLastBet[_players[0]] +
            s_playerToLastBet[_players[1]];
        (bool success, ) = payable(_winner).call{value: quantity}("");
        if (!success) {
            revert BFNFT__FManager__FailedToSendFunds();
        }
        // Reset fight and players' values
        s_figthIdisActive[_fightId] = false;
        CURRENT_BETS_VALUE -= s_playerToLastBet[_players[0]];
        CURRENT_BETS_VALUE -= s_playerToLastBet[_players[1]];
        // Check if using delete saves much gas
        s_hasOnGoingFight[_players[0]] = false;
        s_hasOnGoingFight[_players[1]] = false;
        emit BFNFT__FManager__FightResult(_fightId, _winner);
    }

    /**
     * @dev Function to retire funds from contract.
     * Takes into account ongoing bets and doesn't withdraw that money.
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

    function buyTicket() public payable {
        if (msg.value >= TICKET_PRICE) s_playerToTickects[msg.sender] += 1;
        else revert BFNFT__FManager__NotPayedEnough();
    }

    /**
     * @dev Gets tickets of `_address`. Needed to start fights.
     */
    function getTicketsOf(address _address) public view returns (uint256) {
        return s_playerToTickects[_address];
    }
}
