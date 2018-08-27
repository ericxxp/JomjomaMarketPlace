var MarketPlace = artifacts.require("./MarketPlace.sol");

module.exports = function(deployer,network, accounts){
  deployer.deploy(MarketPlace,{ from: accounts[0], gas:6721975, value: 500000000000000000 });
}
