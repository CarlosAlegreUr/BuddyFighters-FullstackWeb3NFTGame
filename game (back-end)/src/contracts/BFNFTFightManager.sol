// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

import "@openzeppelin/contracts/access/Ownable.sol";

import "./Fight.sol";

/* Customed erros */
error BFNFT__NotEnoughFunds();
error BFNFT__FailedToFundFight();

/**
 * @title BuddyFighters' NFTs Fights Manager contract.
 * @author Carlos Alegre Urquizú
 *
 * @notice This contract manages the deployment of fights with
 * nfts from BuddyFighters collection.
 */
contract BFNFTFightsManager is Ownable {
    /* State variables */
    uint256 private constant START_FIGHT_COMMISSION = 10000000000000000;

    // Battle bids managing variables.
    mapping(address => uint256) private s_clientToFunds;

    /* Events */
    event BFNFT__FightStarted(address indexed battleAddress);
    event BFNFT__WithdrawalResult(bool indexed success);

    /**
     * @dev Checks if client has deposited enough funds before executing the function.
     */
    modifier checkEnoughFunds(address _clientAddress, uint256 _price) {
        if (s_clientToFunds[_clientAddress] < _price) {
            revert BFNFT__NotEnoughFunds();
        }
        _;
    }

    /* Functions */

    /* External functions */

    function useFundsToStartFight(
        address[2] calldata _participants,
        uint256[2] calldata _tokenIds
    )
        external
        payable
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

    /**
     * @dev Gets balance of `_address`. Needed to start and deploy fights.
     *
     * @param _address is the client's address.
     */
    function getBalance(address _address) public view returns (uint256) {
        return s_clientToFunds[_address];
    }
}
