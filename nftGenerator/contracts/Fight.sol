// SPDX-License-Identifier: MIT

pragma solidity ^0.8.9;

error  MoneySentIsLessThanBid();
error FailedToSendMoneyToWInner();
error  FailedToCancelBids();
error FightIsFinished();
error OnlyFightersAreAllowedToCallTheFunction();

contract Fight {
    
    bool private s_isActive;
    address[2] s_players;
    mapping (address => uint256) s_addressToBid;
    bytes32 private immutable s_fightId; 

    uint256 constant MINIMUM_BID = 10000000000000;


    event FightFigthStarted(address indexed p1, address indexed p2, bytes32 indexed fightId);
    event FightBidSet(address indexed plyr, uint256 indexed bid, bytes32 indexed fightId);


    modifier fightIsOn {
        if(s_isActive == false) { revert FightIsFinished(); }
        _;
    }

    modifier isFighter {
        if(msg.sender != s_players[0] || msg.sender != s_players[1]) { revert OnlyFightersAreAllowedToCallTheFunction(); }
        _;
    }

    constructor(address p1, address p2, uint256 nftId1, uint256 nftId2) {
        s_fightId = keccak256(abi.encodePacked(p1, p2, nftId1, nftId2));
        emit FightFigthStarted(p1, p2, s_fightId);
        s_players[0] = p1;
        s_players[1] = p2;
        s_isActive = true;
    }

    
    receive() external payable fightIsOn isFighter {
        if(msg.value < MINIMUM_BID) { revert MoneySentIsLessThanBid(); }
        s_addressToBid[msg.sender] = msg.value;
        emit FightBidSet(msg.sender, msg.value, s_fightId);
    }

    
    fallback() external payable fightIsOn isFighter {
        s_addressToBid[msg.sender] = msg.value;
    }


    function winnerIs(address payable winner) external payable fightIsOn isFighter {
        (bool sent,) = winner.call{value: address(this).balance}("");
        if(sent == false) { revert FailedToSendMoneyToWInner(); }
        s_isActive = false;
    }


    function cancelFight() external payable fightIsOn isFighter { 
        (bool sent,) = payable(s_players[0]).call{value: (address(this).balance - s_addressToBid[s_players[1]])}("");
        (bool sent2,) = s_players[1].call{value: address(this).balance}("");
        if(sent == false || sent2 == false) { revert FailedToCancelBids(); }
        s_isActive = false;
    }


    function isActive() external view returns(bool) { return s_isActive; }


    function getFightId() external view returns(bytes32) { return s_fightId; }
}
