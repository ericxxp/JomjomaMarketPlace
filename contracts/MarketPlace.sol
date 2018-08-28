pragma solidity ^0.4.18;

/** @dev Uses Oracle from EthPM (see installed_contracts) */
import "installed_contracts/oraclize-api/contracts/usingOraclize.sol";

/** @dev Uses Zeppelin from EthPM (see installed_contracts) */
import "installed_contracts/zeppelin/contracts/ownership/Ownable.sol";
import "installed_contracts/zeppelin/contracts/lifecycle/Pausable.sol";

contract MarketPlace is Ownable, usingOraclize, Pausable {
  
   
  /** 
  * @dev  Conversaion rate from Oracle API
  */  
  string public ETHUSD;

  /** 
  * @dev  Item Counter
  */  
  uint itemCounter;


  /** 
  * @dev  Items Mapping List
  */  
  mapping(uint => Item) public items;


  /** 
  * @dev  Event if new item added
  */  
  event sellItemEvent(
    uint indexed _id,
    address indexed _seller,
    string _name,
    uint256 _price);
  /** 
  * @dev  Event if item bought
  */ 
  event buyItemEvent(
    uint indexed _id,
    address indexed _seller,
    address indexed _buyer,
    string _name,
    uint256 _price);

  /** 
  * @dev  Event if price updated from Oracle Api
  */ 
  event LogPriceUpdated(string price);

  /** 
  * @dev  Event Oracle Query hase been sent
  */ 
  event LogNewOraclizeQuery(string description);


  /** 
  * @dev  Create item struct 
  */  
  struct Item {
    uint id;
    address seller;
    address buyer;
    string name;
    string description;
    uint256 price;
  }

 
  /** 
   * @dev Callback function getting result from OracleAPI
   * @param result the result containg the answer we request
   */
  function __callback(bytes32 id, string result, bytes proof)
    public {
        require(msg.sender == oraclize_cbAddress());

        ETHUSD = result;
        emit LogPriceUpdated(ETHUSD);
        updatePrice();
    }

    /** 
    * @dev Constructor to initialze Oracle Api and call the updatePrice to receive latest ETHUSD rate
    */
    function MarketPlace() payable public{

      //change here with the ethereum-bridge generated in your local
     OAR = OraclizeAddrResolverI(0xB45bCafF097e0EC3492A4c39dA3105B693fD9B59);
      oraclize_setProof(proofType_TLSNotary | proofStorage_IPFS);

      updatePrice();
    }

 
    /** 
    * @dev  Oraclize query to receive latest ETHUSD rate every 10 seconds
    */    
   function updatePrice() public payable  {
       if (oraclize_getPrice("URL") > address(this).balance) {
           emit LogNewOraclizeQuery("Oraclize query was NOT sent, please add some ETH to cover for the query fee");
       } else {
           emit LogNewOraclizeQuery("Oraclize query was sent, standing by for the answer..");
           oraclize_query(10,"URL", "json(https://api.gdax.com/products/ETH-USD/ticker).price");
       }
   }

  /** 
  * @dev  fetch the number of items in the contract
  * @return number of items
  */ 
  function getNumberOfItems() public constant returns (uint) {
    return itemCounter;
  }


  /** 
  * @dev  fetch and returns all items IDs available for sale
  * @return items for sale only
  */ 
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


  /** 
  * @dev  Add new item to the items list and emit an event 
  * @param _name title name of the item
  * @param _description description of item
  * @param _price the price of the item in ether
  */ 
  function sellItem(string _name, string _description, uint256 _price) public whenNotPaused {
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

  /** 
  * @dev  buy item and add the buyer address to the item
  * @param _id item id
  */ 
  function buyItem(uint _id) payable public whenNotPaused {
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

   // Fallback function
    function() external payable {

    }

  function kill() onlyOwner public {
    selfdestruct(owner);
  }
}
