
var MarketPlace = artifacts.require("./MarketPlace.sol");

contract('MarketPlace',function(accounts){

  var marketPlaceInstance;
  var seller = accounts[1];
  var buyer = accounts[2];
  var itemName1 = "Book";
  var itemDescription1 = "New Book";
  var itemPrice1 = 3;
  var itemName2 = "IphoneX";
  var itemDescription2 = "Used apple under warrenty";
  var itemPrice2 = 5;
  var sellerBalanceBeforeBuy, sellerBalanceAfterBuy;
  var buyerBalanceBeforeBuy, buyerBalanceAfterBuy;


  it("should be initialized with empty values", function() {
    return MarketPlace.deployed().then(function(instance) {
      marketPlaceInstance = instance;
      return marketPlaceInstance.getNumberOfItems();
    }).then(function(data) {
      assert.equal(data, 0x0, "number of items should be zero");
      return marketPlaceInstance.getItemsForSale();
    }).then(function(data){
      assert.equal(data.length, 0, "items for sale should be empty");
    });
  });

  
  it("should let user sell item", function() {
    return MarketPlace.deployed().then(function(instance) {
      marketPlaceInstance = instance;
      return marketPlaceInstance.sellItem(itemName1, itemDescription1, web3.toWei(itemPrice1, "ether"), {
        from: seller
      });
    }).then(function(receipt) {
    
      assert.equal(receipt.logs[0].args._id.toNumber(), 1, "id should be 1");
      assert.equal(receipt.logs[0].args._seller, seller, "seller should be " + seller);
      assert.equal(receipt.logs[0].args._name, itemName1, "item name should be " + itemName1);
      assert.equal(receipt.logs[0].args._price.toNumber(), web3.toWei(itemPrice1, "ether"), "item price should equal " + web3.toWei(itemPrice1, "ether"));

      return marketPlaceInstance.getNumberOfItems();
    }).then(function(data) {
      assert.equal(data, 1, "number of items should be one");

      return marketPlaceInstance.getItemsForSale();
    }).then(function(data) {
      assert.equal(data.length, 1, "should be only 1 item for sale");
      itemId = data[0].toNumber();
      assert.equal(itemId, 1, "first id should be 1");

      return marketPlaceInstance.items(itemId);
    }).then(function(data) {
      assert.equal(data[0].toNumber(), 1, "item id should be 1");
      assert.equal(data[1], seller, "seller address should be " + seller);
      assert.equal(data[3], itemName1, "item name should be " + itemName1);
      assert.equal(data[4], itemDescription1, "item description should be " + itemDescription1);
      assert.equal(data[5].toNumber(), web3.toWei(itemPrice1, "ether"), "item price should be " + web3.toWei(itemPrice1, "ether"));
    });
  });


  it("should let user sell the second item", function() {
    return MarketPlace.deployed().then(function(instance) {
      marketPlaceInstance = instance;
      return marketPlaceInstance.sellItem(itemName2, itemDescription2, web3.toWei(itemPrice2, "ether"), {
        from: seller
      });
    }).then(function(receipt) {
      assert.equal(receipt.logs[0].args._id.toNumber(), 2, "id should be 2");
      assert.equal(receipt.logs[0].args._seller, seller, "event seller should be " + seller);
      assert.equal(receipt.logs[0].args._name, itemName2, "event item name should be " + itemName2);
      assert.equal(receipt.logs[0].args._price.toNumber(), web3.toWei(itemPrice2, "ether"), "event item price should be " + web3.toWei(itemPrice2, "ether"));

      return marketPlaceInstance.getNumberOfItems();
    }).then(function(data) {
      assert.equal(data, 2, "number of items should be two");

      return marketPlaceInstance.getItemsForSale();
    }).then(function(data) {
      assert.equal(data.length, 2, "there should now be 2 items for sale");
      itemId = data[1].toNumber();
      assert.equal(itemId, 2, "item id should be 2");

      return marketPlaceInstance.items(itemId);
    }).then(function(data) {
      assert.equal(data[0].toNumber(), 2, "item id should be 2");
      assert.equal(data[1], seller, "seller should be " + seller);
      assert.equal(data[2], 0x0, "buyer should be empty");
      assert.equal(data[3], itemName2, "item name should be " + itemName2);
      assert.equal(data[4], itemDescription2, "item description should be " + itemDescription2);
      assert.equal(data[5].toNumber(), web3.toWei(itemPrice2, "ether"), "item price should be " + web3.toWei(itemPrice2, "ether"));
    });
  });


 
  it("should let user buy the first item", function() {
    return MarketPlace.deployed().then(function(instance) {
      marketPlaceInstance = instance;
      itemId = 1;

     
      sellerBalanceBeforeBuy = web3.fromWei(web3.eth.getBalance(seller), "ether").toNumber();
      buyerBalanceBeforeBuy = web3.fromWei(web3.eth.getBalance(buyer), "ether").toNumber();

      return marketPlaceInstance.buyItem(itemId, {
        from: buyer,
        value: web3.toWei(itemPrice1, "ether")
      });
    }).then(function(receipt) {
    
      assert.equal(receipt.logs[0].args._id.toNumber(), itemId, "itemId should be " + itemId);
      assert.equal(receipt.logs[0].args._name, itemName1, "event item name should be " + itemName1);
      assert.equal(receipt.logs[0].args._price.toNumber(), web3.toWei(itemPrice1, "ether"), "event item price should be " + web3.toWei(itemPrice1, "ether"));

     
      sellerBalanceAfterBuy = web3.fromWei(web3.eth.getBalance(seller), "ether").toNumber();
      buyerBalanceAfterBuy = web3.fromWei(web3.eth.getBalance(buyer), "ether").toNumber();

  
      assert(sellerBalanceAfterBuy == sellerBalanceBeforeBuy + itemPrice1, "seller should have get " + itemPrice1 + " ETH");
      assert(buyerBalanceAfterBuy <= buyerBalanceBeforeBuy - itemPrice1, "buyer should have spent " + itemPrice1 + " ETH");

      return marketPlaceInstance.items(itemId);
    }).then(function(data) {
      assert.equal(data[0].toNumber(), 1, "item id should be 1");
      assert.equal(data[1], seller, "seller address should be " + seller);
      assert.equal(data[2], buyer, "buyer address should be " + buyer);
      assert.equal(data[3], itemName1, "item name should be " + itemName1);
      assert.equal(data[4], itemDescription1, "item description should be " + itemDescription1);
      assert.equal(data[5].toNumber(), web3.toWei(itemPrice1, "ether"), "item price should be " + web3.toWei(itemPrice1, "ether"));

      return marketPlaceInstance.getItemsForSale();
    }).then(function(data) {
      assert(data.length, 1, "should remain one item");
    });
  });
});
