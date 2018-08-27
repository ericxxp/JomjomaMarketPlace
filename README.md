# Jomjoma Marketplace on a Ethereum Platform
* Implemented a DApp to create a marketplace on Ethereum Framework.
* The purpose of the DApp is to buy and sell items like ebay website.
* When user log the website he/she will see a list of items that they can buy.
* User can add new item to be sold but the buy button is hidden from them.
* Using MetaMask with a different account can be able to browse the list of items and buy them according to the price of the item.
* Once the item purchased, the amount of money will be sent to the seller account , and event raised showing that the item has been sold.
* The platform uses Oraclize API to convert the item price to USD with the latest conversaion rate updated frequently. The currency used here is only Ether.

## Set up the project


ethereum-bridge is required since the project uses Oraclize API and we want to try locally we need ethereum-bridge 
- Open another terminal 
- `mkdir ethereum-bridge`
- `git clone https://github.com/oraclize/ethereum-bridge ethereum-bridge`
- `cd ethereum-bridge`
- `npm install`
- Depends on your ganache address `node bridge -a 9 -H 127.0.0.1 -p 7545 --dev`
- Wait until you see similar to this `OAR = OraclizeAddrResolverI(0xc0C1027F2bF8084CDe1c749EF21742AA9C4E07Cc);`
- copy the OAR line you have in your terminal and replace it with the old OAR in MarketPlace Contract Constructor.

Now follow open new Terminal and do the following: 

- `truffle test`
- `truffle compile --reset`
- `truffle migrate --reset`
- `npm run dev`
- navigate to [http://localhost:3000](http://localhost:3000)

