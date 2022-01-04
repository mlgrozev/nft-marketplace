// SPDX-License-Identifier: GPL-3.0

pragma solidity >=0.7.0 <0.9.0;

import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";

contract AuctionV0 {
  
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
        // nft contract
        address nftContract;  
     
    }
    
      struct Bid {
        // Bidder's address
        address bidder;
        // Bidders amount
        uint256 amount;
        // Time
        uint256 biddingUnix;
      
    }
    
    
    // the following structs are used for events only
    
    struct referenceAuction {
        address seller;
        uint256 basePrice ;
        uint256 startingTime;
        referenceToken tokenDetails;
    }
    
    struct referenceToken {
        address nftContract; 
        uint256 tokenId;
    }
    
    event AuctionCreated(address indexed seller, uint256 basePrice , uint256 indexed startingTime, uint256 endingTime, referenceToken indexed tokenDetails);
    
    event bidPlaced(address indexed bidder , uint256 amount, uint256 indexed biddingTime, referenceAuction indexed auction  );
    
    event auctionTimeIncreased(address indexed seller, uint256 basePrice , uint256 indexed startingTime, uint256 endingTime, address highestBidder, uint256 highestBid, referenceToken indexed tokenDetails);

    //event auctionEnded(address indexed seller, uint256 basePrice , uint256 indexed startingTime, uint256 endingTime, referenceToken indexed tokenDetails, address bidWinner, uint256 winningBid);

    event pendingReturnsWithdrawn(address indexed user, uint256 indexed amount, uint256 indexed withdrawlTime );

    event auctionConcluded(address indexed seller, uint256 basePrice , uint256 indexed startingTime, uint256 endingTime, referenceToken indexed tokenDetails, address bidWinner, uint256 winningBid, uint256 assetsTransferTime);

    
    
    // Array of auctions for a token
    mapping (address => mapping(uint256 => AuctionDetails)) public tokenIdToAuction;
    
    // Allowed withdrawals for who didnt win the bid
    mapping(address => uint256) public pendingReturns;
    
    // Array of bids in an auction
    mapping( address => mapping(uint256 =>  Bid[])) public auctionBids;

    
    // company's cut in each transfer
    uint256 public companyCutPercentage = 5;
    
    // company's address
     address payable private companyERC20Address;
    
   
   
       constructor(
       address payable _companyERC20Address
    )  {
       companyERC20Address = _companyERC20Address;
    }
    
        function createAuction(uint256 _basePrice, uint256 _endingUnix, address _nftContract, uint256 _tokenId, address _msgSender) public{
        
        AuctionDetails memory auction = tokenIdToAuction[_nftContract][_tokenId];

        _endingUnix = block.timestamp + _endingUnix;
       
        if (auction.seller != address(0)){
        require (auction.ended == true, 'An auction for this nft is already in progress') ;
        
       }
    
        require(_endingUnix - block.timestamp >= 9, "The ending unix should be atleast 5 minutes from now");

        tokenIdToAuction[_nftContract][_tokenId] = AuctionDetails(payable(_msgSender),_basePrice,address(0),0,_endingUnix,block.timestamp,false,_nftContract);
        
        emit AuctionCreated(_msgSender, _basePrice, block.timestamp, _endingUnix, referenceToken(_nftContract,_tokenId));
  
    }

    function getSeller(uint256 _tokenId, address payable _nftContract)public view returns(address payable){
        return tokenIdToAuction[_nftContract][_tokenId].seller;
    }
    
    
  
        function _updateAuctionStatus(uint256 _tokenId, address _nftContract) internal {
            
         AuctionDetails memory auction = tokenIdToAuction[_nftContract][_tokenId];

       require(auction.seller != address(0), 'Auction for this NFT is not in progress');


        if (auction.ended == false){
        if (auction.endingUnix <= block.timestamp){
            auction.ended = true;
            tokenIdToAuction[_nftContract][_tokenId]  = auction;
        }
    }
    
            
        }
  
  
  
  
      function _checkAuctionStatus(uint256 _tokenId, address _nftContract) public view returns(bool){
            
         AuctionDetails memory auction = tokenIdToAuction[_nftContract][_tokenId];

       require(auction.seller != address(0), 'Auction for this NFT is not in progress');

        return auction.ended;

       
      }


 
      function auctionTimeLeft(uint256 _tokenId, address _nftContract) public view returns(uint256){
            
         AuctionDetails memory auction = tokenIdToAuction[_nftContract][_tokenId];
         
        require(auction.seller != address(0), 'Auction for this NFT is not in progress');

        uint256 timeLeft = auction.endingUnix - block.timestamp;
        
        return timeLeft;

       
      }  
 
    
    
    
     function bid(uint256 _tokenId,address _nftContract, uint256 _amount) public payable {

        _updateAuctionStatus(_tokenId,_nftContract);
        
        bool ended = _checkAuctionStatus(_tokenId,_nftContract);
        
        require (ended == false, 'The auction has ended');
        
        require (pendingReturns[msg.sender] + msg.value >= _amount, 'Insufficient funds' );
        
        AuctionDetails memory auction= tokenIdToAuction[_nftContract][_tokenId];

        require (msg.sender != auction.seller, 'You cannot bid in your own auction' );
        

        if (auction.highestBid == 0){
            require(_amount >= auction.basePrice, 'Your bid is lower than the base price');
        }
        else{
        require(_amount > auction.highestBid, 'Your bid is lower than the previous bid');
        require (_amount - auction.highestBid >= 50000000000000000, 'Your bid should be atleast 0.5 eth higher than the last bid' );

        }

        pendingReturns[msg.sender] = pendingReturns[msg.sender] - ( _amount - msg.value );

        if (auction.highestBid != 0) {
            pendingReturns[auction.highestBidder] += auction.highestBid;
        }
        
        auction.highestBid = _amount;
        auction.highestBidder = msg.sender;

        
        if (block.timestamp - auction.endingUnix <= 900 ){
            
            auction.endingUnix = auction.endingUnix + 900;
            emit auctionTimeIncreased(auction.seller, auction.basePrice , auction.startingUnix, auction.endingUnix, auction.highestBidder, auction.highestBid, referenceToken(_nftContract,_tokenId));

        }
        
        
        tokenIdToAuction[_nftContract][_tokenId] = auction;
        auctionBids[_nftContract][_tokenId].push(Bid(msg.sender,_amount,block.timestamp));
        
        emit bidPlaced(msg.sender , _amount, block.timestamp, referenceAuction(auction.seller,auction.basePrice,auction.startingUnix, referenceToken(_nftContract,_tokenId))  );

    }
    
    
    
    
        /// Withdraw funds.
    function withdrawPendingReturns() payable public  {
        require (pendingReturns[msg.sender] > 0 , "You do not have any funds to withdraw");
        
        uint256 pendingReturnAmount = pendingReturns[msg.sender];
        delete pendingReturns[msg.sender];
        payable(msg.sender).transfer(pendingReturnAmount);

        emit pendingReturnsWithdrawn(msg.sender, pendingReturnAmount, block.timestamp );

    }
    
        /// check balance.
    function checkPendingReturnsBalance() view public returns(uint256) {

        return pendingReturns[msg.sender];
    }

    function getBidWinner(uint256 _tokenId, address _nftContract) public view returns(address,uint256){
        AuctionDetails memory auction= tokenIdToAuction[_nftContract][_tokenId];
       require(auction.highestBid >= 0 ,"No bids received");
        return (auction.highestBidder,auction.highestBid);
    }

        /// concludeAuction
    function concludeAuction(uint256 _tokenId, address _nftContract) payable public  {
     
    require((msg.sender == tokenIdToAuction[_nftContract][_tokenId].seller) || (msg.sender == tokenIdToAuction[_nftContract][_tokenId].highestBidder), 'You are not authorized to conclude the auction'  );
    

    _updateAuctionStatus(_tokenId,_nftContract);
     
    bool ended = _checkAuctionStatus(_tokenId,_nftContract);
        
    require (ended == true, 'The auction has not ended yet');
    
    AuctionDetails memory auction = tokenIdToAuction[_nftContract][_tokenId];
    
    
    delete tokenIdToAuction[_nftContract][_tokenId];
    delete auctionBids[_nftContract][_tokenId];
    
    uint256 companyCut = (companyCutPercentage*auction.highestBid)/100;
    uint256 sellerCut = auction.highestBid - companyCut;
    
    
    // ERC721(auction.nftContract).transferFrom(address(this), auction.highestBidder , _tokenId);
     auction.seller.transfer(sellerCut);
     companyERC20Address.transfer(companyCut);

    emit auctionConcluded(auction.seller, auction.basePrice , auction.startingUnix, auction.endingUnix, referenceToken(_nftContract,_tokenId), auction.highestBidder, auction.highestBid, block.timestamp);

    
    
    }

 

  
}

