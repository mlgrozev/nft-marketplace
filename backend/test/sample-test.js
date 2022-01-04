

describe("NFTMarket", function () {
  let Market
  let market
  let Auction
  let auction
  let Factory
  let factory
  let NFT
  let nft
  let Collection
  let collection
  let [_, person1, person2] = [1, 1, 1]

  it("Should create and execute market sales", async function () {
    [_, person1, person2] = await ethers.getSigners()
    Market = await ethers.getContractFactory("Market")
    market = await Market.deploy()
    await market.deployed()
    let marketAddress = market.address

    Auction = await ethers.getContractFactory("Auction")
    auction = await Auction.deploy()
    await auction.deployed()

    Factory = await ethers.getContractFactory("Factory")
    factory = await Factory.deploy(marketAddress)
    await factory.deployed()

    NFT = await ethers.getContractFactory("NFT")
    nft = await NFT.deploy(marketAddress, "minter", "nft", "www.defaultnft.com/")
    await nft.deployed()
   

    Collection = await ethers.getContractFactory("Collection")
    collection = await Collection.deploy(marketAddress, "minter", "nft", "www.defaultnft.com/", _.address)
     await collection.deployed()

     let res = await collection.
    //createAuction(uint256 _basePrice, uint256 _endingUnix, address _nftContract, uint256 _tokenId, address _msgSender) public
  })
  // it("Should create and execute Auction", async function () {

  //   const _value = await ethers.utils.parseUnits('10', 'wei')
  //   const _value2 = await ethers.utils.parseUnits('15', 'wei')
  //   let tx = await auction.createAuction(10, 10, nft.address, 1, _.address)
  //   await tx.wait()
  //   let bid = await auction.connect(person1).bid(nft.address, 1, { value: _value })
  //   await bid.wait()
  //   bid = await auction.connect(person2).bid(nft.address, 1, { value: _value2 })
  //   await bid.wait()
  //   await new Promise(resolve => setTimeout(resolve, 11000));
  //   bid = await auction.connect(person2).bid(nft.address, 1, { value: _value })
  //   await bid.wait()

  // })



















  // it("generate collection", async function () {

  //   let ss = await factory.connect(person1).createCollection("mynft", "nn", "www.google.com/");
  //   await ss.wait()
  //   console.log("person 1 ", person1.address)
  //   console.log("collection", ss)
  // })
  // it("get collection URI", async function () {

  //   let col1 = await factory.ownerIdToCollection(person1.address, 0)
  //   console.log("collection 1", col1)
  //   let collection = await Collection.attach(col1)


  //   let mint = await collection.connect(person1).createToken("first")
  //   await mint.wait()
  //   let URI = await collection.tokenURI(1)
  //   console.log("collection", URI)

  // })




  // it("generate collection", async function () {

  //   let ss = await factory.connect(person1).createCollection();
  //   await ss.wait()
  //   console.log("person 1 ", person1.address)
  //   console.log("collection", ss.data)
  // })

  // it("check collection count", async function () {

  //   let ss = await factory.collections(_.address);
  //   console.log("collection", ss.toNumber())
  // })
  // it("check collection count", async function () {

  //   let ss = await factory.collections(person1.address);
  //   console.log("collection", ss.toNumber())
  // })
  // it("check collection address", async function () {
  //   let col1 = await factory.ownerIdToCollection(person1.address, 0)
  //   console.log("collection 1", col1)
  //   col1 = await factory.ownerIdToCollection(person1.address, 1)
  //   console.log("collection 2", col1)
  //   col1 = await factory.ownerIdToCollection(person1.address, 2)
  //   console.log("collection 3", col1)
  // })
  // it("generate collection", async function () {

  //   let ss = await factory.connect(person1).createCollection();
  //   await ss.wait()
  //   console.log("person 1 ", person1.address)
  //   console.log("collection", ss.data)
  // })
  // it("check collection address", async function () {
  //   let col1 = await factory.ownerIdToCollection(person1.address, 0)
  //   console.log("collection 1", col1)
  //   col1 = await factory.ownerIdToCollection(person1.address, 1)
  //   console.log("collection 2", col1)
  //   col1 = await factory.ownerIdToCollection(person1.address, 2)
  //   console.log("collection 3", col1)
  // })

})