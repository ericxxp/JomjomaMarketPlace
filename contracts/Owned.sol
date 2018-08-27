pragma solidity ^0.4.18;

contract Owned {
  // State variables
  address owner;

  //modifiers
  modifier onlyOwner() {
    require(msg.sender == owner);
    _;
  }

  // constructor
  function Owned() public{
    owner = msg.sender;
  }
}
