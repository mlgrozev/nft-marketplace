// SPDX-License-Identifier: MIT OR Apache-2.0
pragma solidity ^0.8.4;
import "@openzeppelin/contracts/utils/Context.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "./NFT.sol";

import "hardhat/console.sol";


contract Collection is NFT , Ownable{

   // Mapping from owner to list of owned token IDs
    mapping(address => mapping(uint256 => uint256)) private _ownedTokens;

    // // Mapping from token ID to index of the owner tokens list
    mapping(uint256 => uint256) private _ownedTokensIndex;

    // // Array with all token ids, used for enumeration
    uint256[] private _allTokens;

    // // Mapping from token id to position in the allTokens array
    mapping(uint256 => uint256) private _allTokensIndex;


    constructor(address marketplaceAddress,
    string memory name,
    string memory symbol,
    string memory baseURI_,address newOwner) NFT(marketplaceAddress,name,symbol,baseURI_){
        transferOwnership(newOwner);
    }

    function createToken(string memory tokenURI) public override onlyOwner returns (uint) {  
    //    _ownedTokens[_msgSender()]
       return super.createToken(tokenURI);
    }

}