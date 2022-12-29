// SPDX-License-Identifier: MIT

pragma solidity ^0.8.9;

error Fight__MoneySentIsLessThanBid();
error Fight__FailedToSendMoneyToWinner();
error Fight__FailedToCancelAndReturnBids();
error Fight__FightIsFinished();
error Fight__WinnersPrizeIsOnlyForPlayers();
error Fight__OnlyFightersAreAllowedToCallTheFunction();
error Fight__OnlyAdminIsAllowedToCallTheFunction();

contract Fight {
    bytes32 private immutable s_fightId;
    address private immutable i_adminAddress;

    bool private s_isActive;
    address private s_winner;
    address[2] private s_players;

    event Fight__FightCanceled(
        address indexed playerWhoCanceled,
        bytes32 indexed fightId
    );

    modifier isFighter() {
        if (msg.sender != s_players[0] && msg.sender != s_players[1]) {
            revert Fight__OnlyFightersAreAllowedToCallTheFunction();
        }
        _;
    }

    modifier isAdminCalling() {
        if (msg.sender != i_adminAddress) {
            revert Fight__OnlyAdminIsAllowedToCallTheFunction();
        }
        _;
    }

    modifier isActive() {
        if (s_isActive == false) {
            revert Fight__FightIsFinished();
        }
        _;
    }

    modifier sendingToPlayers(address _sedingTo) {
        if (_sedingTo != s_players[0] && _sedingTo != s_players[1]) {
            revert Fight__WinnersPrizeIsOnlyForPlayers();
        }
        _;
    }

    constructor(
        address p1,
        address p2,
        uint256 nftId1,
        uint256 nftId2,
        address admin
    ) {
        s_fightId = keccak256(abi.encodePacked(p1, p2, nftId1, nftId2));
        i_adminAddress = admin;
        s_players[0] = p1;
        s_players[1] = p2;
        s_isActive = true;
    }

    receive() external payable {}

    fallback() external payable {}

    function winnerIs(
        address _winner
    ) external payable isAdminCalling sendingToPlayers(_winner) {
        s_isActive = false;
        s_winner = _winner;
        (bool sent, ) = payable(_winner).call{value: address(this).balance}("");
        if (sent == false) {
            revert Fight__FailedToSendMoneyToWinner();
        }
    }

    function cancelFight() external isFighter isActive {
        (bool sent, ) = payable(s_players[0]).call{
            value: (payable(address(this)).balance / 2)
        }("");
        (bool sent2, ) = payable(s_players[1]).call{
            value: payable(address(this)).balance
        }("");
        if (sent == false || sent2 == false) {
            revert Fight__FailedToCancelAndReturnBids();
        }
        s_isActive = false;
        emit Fight__FightCanceled(msg.sender, s_fightId);
    }

    function getFightId() external view returns (bytes32) {
        return s_fightId;
    }

    function getActive() public view returns (bool) {
        return s_isActive;
    }

    function getWinner() public view returns (address) {
        return s_winner;
    }
}
