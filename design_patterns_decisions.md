Jomjoma Marketplace follow the design pattern factory allowing other contract to extend and manage easily Marketplace contract.

## Design pattern decissions

I have used many solidity design patterns in this smart contract which are described as follows.

### 1.  Circuit Breaker

Using Zeppelin Library installed from EthPM I use the Pausable Library to allow Contract owner to pause critical function such as buyItem which transfer money to an address.

### 2. Ownership transfer

The Contract allow owner to transfer ownership using Ownable Library provided by OpenZeppelin.  

### 3. Contract Destruction 

The Contract allow owner to kill the contract and transfer all money to the owner address.  

### 4. Avoid Looping 

Looping take too much gas when there is a long list in this case using counter pattern and mapping avoid spending too much gas.

### 5. Restricting Access
Many functions in the contract need a restrict access in this case require and modifiers have been used, such as: onlyOwener
And also require used to check if the buyer address is not the seller address
 ```javascript
require(item.seller != msg.sender);
```


