// SPDX-License-Identifier: MIT OR Apache-2.0
pragma solidity ^0.8.4;

import "@openzeppelin/contracts/utils/Context.sol";
import "./Collection.sol";

import "hardhat/console.sol";

contract Factory is Context {

    address public market;
    
    //Mapping of own collections
    mapping(address => mapping(uint256 => address)) public ownerIdToCollection;
    //Number of collection
    mapping(address => uint256) public collections;

    constructor(address _market){
        market = _market;
    }

    function createCollection(string calldata name,string calldata symbol,string calldata baseURI)public returns(address){
        uint256 id = collections[_msgSender()];
         Collection collection = new Collection(market,name,symbol,baseURI,_msgSender());
        address addr = address(collection);
        ownerIdToCollection[_msgSender()][id] = addr;
        collections[_msgSender()]++;
        return addr;
    }

}