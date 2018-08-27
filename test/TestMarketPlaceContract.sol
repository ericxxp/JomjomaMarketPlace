pragma solidity ^0.4.17;

import "truffle/Assert.sol";
import "truffle/DeployedAddresses.sol";
import "../contracts/MarketPlace.sol";


contract TestMarketPlaceContract {
    struct Item {
    uint id;
    address seller;
    address buyer;
    string name;
    string description;
    uint256 price;
  }
    MarketPlace market = MarketPlace(DeployedAddresses.MarketPlace());

    function testUserCanSellItem() public {
        market.sellItem("Book","book des",1 ether);
        market.sellItem("Car","Car desc",2 ether);
        market.sellItem("Mobile","Mobile des",3 ether);

        uint expected = 3;
        uint returnedAdd = market.getNumberOfItems();
        
        Assert.equal(returnedAdd, expected, "3 items should be recorded");
    }

 

}