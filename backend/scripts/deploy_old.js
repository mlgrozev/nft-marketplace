const hre = require("hardhat");
const fs = require('fs');

async function main() {
    [_, person1, person2] = await hre.ethers.getSigners()
  const NFTMarket = await hre.ethers.getContractFactory("Market");
  const nftMarket = await NFTMarket.deploy();
  await nftMarket.deployed();
  console.log("nftMarket deployed to:", nftMarket.address);

  const NFT = await hre.ethers.getContractFactory("NFT");
  const nft = await NFT.deploy(nftMarket.address, "test", "TEST", "https://ipfs.infura.io/ipfs/");
  await nft.deployed();
  console.log("nft deployed to:", nft.address);

  const Factory = await hre.ethers.getContractFactory("Factory");
  const factory = await Factory.deploy(nftMarket.address);
  await factory.deployed();
  console.log("factory deployed to:", factory.address);

  const Collection = await hre.ethers.getContractFactory("Collection");
  const collection = await Collection.deploy(nftMarket.address, "test", "TEST", "https://ipfs.infura.io/ipfs/",_.address );
  await collection.deployed();
  console.log("Collection deployed to:", collection.address);

  let config = `
  export const nftmarketaddress = "${nftMarket.address}"
  export const nftaddress = "${nft.address}"
  export const factoryaddress = "${factory.address}"
   export const collectionaddress = "${collection.address}"
  `

  let data = JSON.stringify(config)
  fs.writeFileSync('config.js', JSON.parse(data))
   fs.writeFileSync('./../frontend/src/config.js', JSON.parse(data))

}

main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error);
    process.exit(1);
  });