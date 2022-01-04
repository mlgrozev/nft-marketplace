// SPDX-License-Identifier: GPL-3.0

pragma solidity >=0.7.0 <0.9.0;

import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import "@openzeppelin/contracts/utils/Context.sol";
import "@openzeppelin/contracts/access/Ownable.sol";


contract Auction is Context , Ownable{

    uint256 public up;
    bool public end;

// Represents an auction on an NFT
    struct AuctionDetails {
        // Current owner of NFT
        address payable seller;
        // Price (in wei) at beginning of auction
        uint256 basePrice;
        // Highest bidder
        address highestBidder;
        // Highest bid (in wei)
        uint256 highestBid;
        // Duration (in seconds) of auction
        uint256 endingUnix;
        // Time when auction started
        uint256 startingUnix;
        // To check if the auction has ended
        bool ended;
          
    }

     struct Bid {
        // Bidder's address
        address bidder;
        // Bidders amount
        uint256 amount;
        // Time
        uint256 biddingUnix;
      
    }
        // Mappings
    // Array of auctions for a token
    mapping (address => mapping(uint256 => AuctionDetails)) private tokenIdToAuction;
    // BidsPayedPerToken
    mapping (address => mapping(address => mapping(uint256 => uint256))) payedBids;
    // Array of bids in an auction
    mapping( address => mapping(uint256 => Bid[])) private auctionBids;
    // Allowed withdrawals for who didnt win the bid
    mapping(address => uint256) private pendingReturns;



     constructor(){
        transferOwnership(_msgSender());
    }

        // Events

    function createAuction(uint256 _basePrice, uint256 _endingUnix, address _nftContract, uint256 _tokenId, address _msgSender) public returns(uint256){

        require(tokenIdToAuction[_nftContract][_tokenId].startingUnix <= 0,"The Auction has already started");
        
        //re-auction must be added
        //AuctionDetails memory auction = tokenIdToAuction[_nftContract][_tokenId];
        
        _endingUnix = _endingUnix * 1 seconds;
        _endingUnix = block.timestamp + _endingUnix;
        
        require(_endingUnix - block.timestamp >= 9, "The ending unix should be atleast 5 minutes from now");

        tokenIdToAuction[_nftContract][_tokenId] = AuctionDetails(payable(_msgSender),_basePrice,address(0),0,_endingUnix,block.timestamp,false);
        
        return tokenIdToAuction[_nftContract][_tokenId].startingUnix;
        
        //emit AuctionCreated(_msgSender, _basePrice, block.timestamp, _endingUnix, referenceToken(_nftContract,_tokenId));
  
    }
    
    function _updateStatus(address _nftContract,uint256 _tokenId) public {      //private

     up++;

     AuctionDetails memory auction= tokenIdToAuction[_nftContract][_tokenId];
     require(auction.ended == false,"This auction has Ended");
    
     if(block.timestamp > tokenIdToAuction[_nftContract][_tokenId].endingUnix){
        auction.ended = true;
        auction.seller =  payable (address(0));
      
        _returnBids(_nftContract,_tokenId);

     }

      tokenIdToAuction[_nftContract][_tokenId] = auction;
    }

    function getLastTime(address _nftContract ,uint256 _tokenId) public view returns(uint){
        AuctionDetails memory auction= tokenIdToAuction[_nftContract][_tokenId];
        return auction.endingUnix;
    }

    function getCurrentTime()public view returns(uint256){
        return block.timestamp;
    }

    function _returnBids(address _nftContract,uint256 _tokenId) private {
        
        Bid[] memory _bid = auctionBids[_nftContract][_tokenId];
        AuctionDetails memory auction= tokenIdToAuction[_nftContract][_tokenId];
                
        for(uint256 i=0;i<=_bid.length-1;i++){
            if(_bid[i].amount != auction.highestBid ){
            pendingReturns[_bid[i].bidder] += payedBids[_bid[i].bidder][_nftContract][_tokenId];
            }
        }
    }
    
    function getHighestBid(address _nftContract,uint256 _tokenId)public view returns(uint256){

        AuctionDetails memory auction= tokenIdToAuction[_nftContract][_tokenId];
        return auction.highestBid;

    }
    
    function getAuctionEnded(address _nftContract,uint256 _tokenId)public returns(bool){

        AuctionDetails memory auction= tokenIdToAuction[_nftContract][_tokenId];
        _updateStatus(_nftContract,_tokenId);
        return auction.ended;

    }

    function getPendingReturns()public view returns(uint256){
        return pendingReturns[msg.sender];
    }

    function withdraw() public payable {  // msg.sender -> address in parameter

        require(pendingReturns[msg.sender] > 0 , "No Tokens pending");

        uint256 amount = pendingReturns[msg.sender];
        address payable receiver =payable(msg.sender);

        receiver.transfer(amount);
    } 


    function bid(address _nftContract ,uint256 _tokenId) public payable { // msg.sender -> address parameter
        
         AuctionDetails memory auction= tokenIdToAuction[_nftContract][_tokenId];
         require(auction.ended == false , "Auction has ended");
         
         require(auction.seller !=address(0),"Auction does not exist");

         end = auction.ended;

         _updateStatus(_nftContract,_tokenId);
         if(block.timestamp < auction.endingUnix){ 

         uint256 amount = payedBids[_msgSender()][_nftContract][_tokenId];
        
         require (auction.highestBid <  msg.value + amount && auction.basePrice<=msg.value + amount ,"Please send more funds");
         require (msg.sender != auction.seller, 'You cannot bid in your own auction' );
        
         payedBids[_msgSender()][_nftContract][_tokenId]=amount + msg.value;
         amount = payedBids[_msgSender()][_nftContract][_tokenId];
         
         auction.highestBid = amount;
         auction.highestBidder = msg.sender;
         auctionBids[_nftContract][_tokenId].push(Bid(_msgSender(),amount,block.timestamp));
         tokenIdToAuction[_nftContract][_tokenId] = auction;

         }               
    }

    function _checkAuctionStatus(uint256 _tokenId, address _nftContract) public view returns(bool){
            
         AuctionDetails memory auction = tokenIdToAuction[_nftContract][_tokenId];

       require(auction.seller != address(0), 'Auction for this NFT is not in progress');

        return auction.ended;

       
      }

    function concludeAuction(uint256 _tokenId, address _nftContract) payable public {

    AuctionDetails memory auction = tokenIdToAuction[_nftContract][_tokenId];
    require((msg.sender == tokenIdToAuction[_nftContract][_tokenId].seller) || (msg.sender == tokenIdToAuction[_nftContract][_tokenId].highestBidder), 'You are not authorized to conclude the auction'  );
    require(auction.endingUnix < block.timestamp,"Auction Time remaining");

    bool ended = _checkAuctionStatus(_tokenId,_nftContract);

    if(!ended){
        _updateStatus(_nftContract,_tokenId);
    }
    
    delete tokenIdToAuction[_nftContract][_tokenId];
    delete auctionBids[_nftContract][_tokenId];
    
    uint256 payment = auction.highestBid;
    
    
    // ERC721(auction.nftContract).transferFrom(address(this), auction.highestBidder , _tokenId);
     auction.seller.transfer(payment);

    }
}

