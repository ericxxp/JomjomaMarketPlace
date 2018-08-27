App = {
  web3Provider: null,
  contracts: {},
  account: 0x0,
  loading: false,
  ETHUSD: 0,

  init: function() {
    return App.initWeb3();
  },

  initWeb3: function() {
    
    if (typeof web3 !== 'undefined') {
      App.web3Provider = web3.currentProvider;
      web3 = new Web3(web3.currentProvider);
    } else {
      
      App.web3Provider = new Web3.providers.HttpProvider('http://localhost:8545');
      web3 = new Web3(App.web3Provider);
    }
    App.displayAccountInfo();
    return App.initContract();
  },

  displayAccountInfo: function() {
    web3.eth.getCoinbase(function(err, account) {
      if (err === null) {
        App.account = account;
        $("#account").text("Your Address: "+  account);
        web3.eth.getBalance(account, function(err, balance) {
          if (err === null) {
            $("#accountBalance").text("Your Balances: "+ web3.fromWei(balance, "ether") + " ETH = " + (web3.fromWei(balance, "ether")*App.ETHUSD).toFixed(2) + " USD (Conversion Rate from Oracle API)");
          }
        });
      }
    });
  },

  initContract: function() {
    $.getJSON('MarketPlace.json', function(marketPlaceArtifact) {
      
      App.contracts.MarketPlace = TruffleContract(marketPlaceArtifact);

     
      App.contracts.MarketPlace.setProvider(App.web3Provider);
      
     
      App.listenToEvents();

     
      return App.reloadItems();
    });
  },

  reloadItems: function() {
  
    if (App.loading) {
      return;
    }
    App.loading = true;

    
    App.displayAccountInfo();

    var marketPlaceInstance;

    App.contracts.MarketPlace.deployed().then(function(instance) {
      marketPlaceInstance = instance;
     
      return marketPlaceInstance.getItemsForSale();
    }).then(function(itemIds) {
    
      var itemsRow = $('#itemsRow');
      itemsRow.empty();

      for (var i = 0; i < itemIds.length; i++) {
        var itemId = itemIds[i];
        marketPlaceInstance.items(itemId.toNumber()).then(function(item) {
          App.displayItem(
            item[0],
            item[1],
            item[3],
            item[4],
            item[5]
          );
        });
      }
      App.loading = false;
    }).catch(function(err) {
      console.log(err.message);
      App.loading = false;
    });
  },

  displayItem: function(id, seller, name, description, price) {
   
    var itemsRow = $('#itemsRow');

    var etherPrice = web3.fromWei(price, "ether");

    // refill the template
    var itemTemplate = $('#itemTemplate');
    itemTemplate.find('.panel-title').text(name);
    itemTemplate.find('.item-description').text(description);
    itemTemplate.find('.item-price').text(etherPrice + " ETH = " + (etherPrice*App.ETHUSD).toFixed(2) + " USD (rate using EthPM Oraclize api)");
    itemTemplate.find('.btn-buy').attr('data-id', id);
    itemTemplate.find('.btn-buy').attr('data-value', etherPrice);

   // Hide the buy button if it is the seller
    if (seller == App.account) {
      itemTemplate.find('.item-seller').text(seller);
      itemTemplate.find('.btn-buy').hide();
    } else {
      itemTemplate.find('.item-seller').text(seller);
      itemTemplate.find('.btn-buy').show();
    }

    // append new item to the html file
    itemsRow.append(itemTemplate.html());
  },

  sellItem: function() {
    // retrieve the item data from the modal 
    var _item_name = $("#item_name").val();
    var _description = $("#item_description").val();
    var _price = web3.toWei(parseFloat($("#item_price").val() || 0), "ether");

    if ((_item_name.trim() == '') || (_price == 0)) {
      
      return false;
    }

    App.contracts.MarketPlace.deployed().then(function(instance) {
      return instance.sellItem(_item_name, _description, _price, {
        from: App.account,
        gas: 500000
      });
    }).then(function(result) {

    }).catch(function(err) {
      console.error(err);
    });
  },



  //trigger events raised from the contract
  listenToEvents: function() {
    App.contracts.MarketPlace.deployed().then(function(instance) {
      instance.sellItemEvent({}, {
        fromBlock: 0,
        toBlock: 'latest'
      }).watch(function(error, event) {
        if(!error){
          
          $("#events").append('<li class="list-group-item">' +' New! Item '+ event.args._name + ' Price: ' + web3.fromWei(event.args._price, "ether") + ' ETH </li>');
        } else {
          console.error(error);
        }
        App.reloadItems();
      });

      instance.buyItemEvent({}, {
        fromBlock: 0,
        toBlock: 'latest'
      }).watch(function(error, event) {
        if(!error){
          $("#events").append('<li class="list-group-item">' + ' Item ' + event.args._name + 'bought by ' + event.args._buyer +  '</li>');
        } else {
          console.error(error);
        }
        App.reloadItems();
      });

      instance.LogPriceUpdated({}, {
        fromBlock: 0,
        toBlock: 'latest'
      }).watch(function(error, event) {
        if(!error){
          App.ETHUSD = event.args.price;
          App.displayAccountInfo();
          console.log(event.args.price);
      
        } else {
          console.error(error);
        }
       
      });

      instance.LogNewOraclizeQuery({}, {
        fromBlock: 0,
        toBlock: 'latest'
      }).watch(function(error, event) {
        if(!error){
          console.log(event.args.description);
  
        } else {
          console.error(error);
        }
        
      });


    });
  },

  buyItem: function() {
    event.preventDefault();

    // retrieve the item price
    var _itemId = $(event.target).data('id');
    var _price = parseFloat($(event.target).data('value'));

    App.contracts.MarketPlace.deployed().then(function(instance) {
      return instance.buyItem(_itemId, {
        from: App.account,
        value: web3.toWei(_price, "ether"),
        gas: 500000
      });
    }).then(function(result) {

    }).catch(function(err) {
      console.error(err);
    });
  },
};

$(function() {
  $(window).load(function() {
    App.init();
  });
});
