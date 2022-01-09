// SPDX-License-Identifier: MIT OR Apache-2.0
pragma solidity ^0.8.4;

import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";

import "hardhat/console.sol";

contract NFT is ERC721, ERC721Enumerable, ERC721URIStorage {
    using Counters for Counters.Counter;
    Counters.Counter private _tokenIds;
    address contractAddress;
    string public baseURI;


    constructor(address marketplaceAddress,
    string memory name,
    string memory symbol,
    string memory baseURI_) ERC721(name,symbol) {
        contractAddress = marketplaceAddress;
        baseURI = baseURI_;
    }

    function createToken(string memory uri) public virtual returns (uint) {
        uint256 newItemId = _tokenIds.current();
        _tokenIds.increment();

        _safeMint(_msgSender(), newItemId);
        setApprovalForAll(contractAddress, true);
        _setTokenURI(newItemId, uri);
        return newItemId;
    }

    function _baseURI() internal view override returns (string memory) {
        return baseURI;
    }
    // The following functions are overrides required by Solidity.

    function _beforeTokenTransfer(address from, address to, uint256 tokenId)
        internal
        override(ERC721, ERC721Enumerable)
    {
        super._beforeTokenTransfer(from, to, tokenId);
    }

    function _burn(uint256 tokenId) internal override(ERC721, ERC721URIStorage) {
        super._burn(tokenId);
    }

    function tokenURI(uint256 tokenId)
        public
        view
        override(ERC721, ERC721URIStorage)
        returns (string memory)
    {
        return super.tokenURI(tokenId);
    }

    function supportsInterface(bytes4 interfaceId)
        public
        view
        override(ERC721, ERC721Enumerable)
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }

}