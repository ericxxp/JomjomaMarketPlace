pragma solidity ^0.4.18;

import "./Owned.sol";
import "installed_contracts/oraclize-api/contracts/usingOraclize.sol";

contract MarketPlace is Owned,usingOraclize {
  
  // Conversaion rate from Oracle API
  string public ETHUSD;


  event LogConstructorInitiated(string nextStep);
  event LogPriceUpdated(string price);
  event LogNewOraclizeQuery(string description);

  function __callback(bytes32 id, string result, bytes proof)
    public {
        require(msg.sender == oraclize_cbAddress());

        ETHUSD = result;
        emit LogPriceUpdated(ETHUSD);
        updatePrice();
    }

  
    function MarketPlace() payable public{

      //change here with the ethereum-bridge generated in your local
     OAR = OraclizeAddrResolverI(0x103C6CAB3CC9F2C0Eb9C46C179835fD5C607395b);
      oraclize_setProof(proofType_TLSNotary | proofStorage_IPFS);

      updatePrice();
    }

    // Fallback function
    function()
    public{
        revert();
    }
   function updatePrice() public payable  {
       if (oraclize_getPrice("URL") > address(this).balance) {
           emit LogNewOraclizeQuery("Oraclize query was NOT sent, please add some ETH to cover for the query fee");
       } else {
           emit LogNewOraclizeQuery("Oraclize query was sent, standing by for the answer..");
           oraclize_query("URL", "json(https://api.gdax.com/products/ETH-USD/ticker).price");
       }
   }



  struct Item {
    uint id;
    address seller;
    address buyer;
    string name;
    string description;
    uint256 price;
  }

  // Items List
  mapping(uint => Item) public items;
  uint itemCounter;


  event sellItemEvent(
    uint indexed _id,
    address indexed _seller,
    string _name,
    uint256 _price);

  event buyItemEvent(
    uint indexed _id,
    address indexed _seller,
    address indexed _buyer,
    string _name,
    uint256 _price);




  // fetch the number of items in the contract
  function getNumberOfItems() public constant returns (uint) {
    return itemCounter;
  }

  // fetch and returns all items IDs available for sale
  function getItemsForSale() public constant returns (uint[]) {
    // check at least one item
    if(itemCounter == 0) {
      return new uint[](0);
    }

    uint[] memory itemIds = new uint[](itemCounter);

    uint numberOfItemsForSale = 0;
    
    for (uint i = 1; i <= itemCounter; i++) {
      // retrive the ID of items not sold yet
      if (items[i].buyer == 0x0) {
        itemIds[numberOfItemsForSale] = items[i].id;
        numberOfItemsForSale++;
      }
    }

    
    uint[] memory filteredItems = new uint[](numberOfItemsForSale);
    for (uint j = 0; j < numberOfItemsForSale; j++) {
      filteredItems[j] = itemIds[j];
    }
    return (filteredItems);
  }


  //sell an item
  function sellItem(string _name, string _description, uint256 _price) public {
    // increase counter of items
    itemCounter++;

    //save this item to items mapping
    items[itemCounter] = Item(
        itemCounter,
        msg.sender,
        0x0,
        _name,
        _description,
        _price
      );

    // trigger the event
    emit sellItemEvent(itemCounter, msg.sender, _name, _price);
  }
  // buy an Item
  function buyItem(uint _id) payable public {
    //at least on item
    require(itemCounter > 0);

    // check if the item exist
    require(_id > 0 && _id <= itemCounter);

    
    Item storage item = items[_id];

    // check of the item not been sold
    require(item.buyer == 0x0);

    // the sellet cannot buy his item
    require(item.seller != msg.sender);

    // check the value of ether sent to the item price
    require(item.price == msg.value);

    // store buyer address
    item.buyer = msg.sender;

    // send the money to the seller
    item.seller.transfer(msg.value);

    // raise the event
    emit buyItemEvent(_id, item.seller, item.buyer, item.name, item.price);
  }


  function kill() onlyOwner public {
    selfdestruct(owner);
  }
}
