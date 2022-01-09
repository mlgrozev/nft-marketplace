import { ethers } from "ethers";
import { useEffect, useState } from "react";
import axios from "axios";
import Web3Modal from "web3modal";
import {
  nftaddress,
  nftmarketaddress,
  factoryaddress,
  collectionaddress,
} from "../config";
import Market from "./../artifacts/contracts/Market.sol/Market.json";
import NFT from "./../artifacts/contracts/NFT.sol/NFT.json";
import Factory from "./../artifacts/contracts/Factory.sol/Factory.json";
import Collection from "./../artifacts/contracts/Collection.sol/Collection.json";
// let rpcEndpoint = "https://matic-mumbai.chainstacklabs.com/89aa0cf029e948ee883b0bf906f2f3df"
// let rpcEndpoint = "https://ropsten.infura.io/v3/40c2813049e44ec79cb4d7e0d18de173"
let rpcEndpoint = "http://localhost:8545";

export default function Home() {
  const [nfts, setNfts] = useState([]);
  const [collections, setCollections] = useState([]);
  const [collectionInformation, setCollectionInformation] = useState({});
  const [loadingState, setLoadingState] = useState("not-loaded");
  useEffect(() => {
    loadNFTs();
  }, []);
  async function loadNFTs() {
    const provider = new ethers.providers.JsonRpcProvider(rpcEndpoint);
    const marketContract = new ethers.Contract(
      nftmarketaddress,
      Market.abi,
      provider
    );
    const data = await marketContract.fetchMarketItems();

    // const numberOfItems = await marketContract.nftContractToItemCounter(address);
    // console.log('NumberOfCollections', numberOfItems);
    let listOfCollections = [];
    // for (let index = 0; index < numberOfItems.toNumber(); index++) {
    //   let itm = await marketContract.nftContractToItemId(address, index);
    //   listOfCollections.push(itm);
    // }
    // console.log("listofcoll", listOfCollections);

    let items = await Promise.all(
      data.map(async (i) => {
        const tokenContract = new ethers.Contract(
          i.nftContract,
          Collection.abi,
          provider
        );
        const tokenUri = await tokenContract.tokenURI(i.tokenId);
        const meta = await axios.get(tokenUri);
        let price = ethers.utils.formatUnits(i.price.toString(), "ether");
        let item = {
          price,
          nftContract: i.nftContract,
          itemId: i.itemId.toNumber(),
          seller: i.seller,
          owner: i.owner,
          image: meta.data.image,
          name: meta.data.name,
          description: meta.data.description,
          isAuction: i.isAuction,
        };
        let nftAddress = i.nftContract;
        listOfCollections.push(nftAddress);
        collectionInformation[nftAddress] = {
          name: await tokenContract.name(),
          symbol: await tokenContract.symbol(),
        };
        // listOfCollections[nftAddress] = [...listOfCollections, {name: tokenContract.name, description: tokenContract.description, items: {[i.itemId.toString()]: item}}];
        // listOfCollections = [{nftAddress: [nftAddress], name: await tokenContract.name(), symbol: await tokenContract.symbol(), items: {[i.itemId.toString()]: item}}];
        return item;
      })
    );
    console.log("items", items);
    console.log("listOfCollections", listOfCollections);
    listOfCollections = [...new Set(listOfCollections)];
    console.log("listOfCollections", listOfCollections);
    for (let i = 0; i < listOfCollections.length; i++) {
      let nftContract = listOfCollections[i];
      collectionInformation[nftContract].items = items.filter(
        (nft) => nft.nftContract == nftContract
      );
    }
    // listOfCollectionsWithitems =
    console.log("collectionInformation", collectionInformation);
    items = items.filter((nft) => nft.isAuction == false);
    setNfts(items);
    setCollections(listOfCollections);
    setCollectionInformation(collectionInformation);
    setLoadingState("loaded");
    console.log(nfts);
  }
  async function buyNft(nft) {
    const web3Modal = new Web3Modal();
    const connection = await web3Modal.connect();
    const provider = new ethers.providers.Web3Provider(connection);
    const signer = provider.getSigner();
    const contract = new ethers.Contract(nftmarketaddress, Market.abi, signer);
    console.log("nft.nftContract", nft.nftContract);
    const price = ethers.utils.parseUnits(nft.price.toString(), "ether");
    const transaction = await contract.createMarketSale(
      nft.nftContract,
      nft.itemId,
      {
        value: price,
      }
    );
    await transaction.wait();
    loadNFTs();
  }
  if (loadingState === "loaded" && !nfts.length)
    return <h1 className="px-20 py-10 text-3xl">No items in marketplace</h1>;
  return (
    <>
      <h1 className="text-center text-5xl font-bold bg-white">MarketPlace</h1>
      <h2 className="text-center text-4xl bg-white pb-10">Collections for sale:</h2>
      <hr></hr>
      <div className="flex justify-center">
        <div className="px-4 pb-10" style={{ maxWidth: "1600px" }}>
          {collections &&
            collections.map((collection, i) => (
              <div className="">
                <h3 className="text-center text-3xl bg-white font-bold">
                  <a href={'/collection-detail/' + collection}>{collectionInformation[collection].name}</a>
                </h3>
                <div className="flex justify-evenly grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-4">
                  {collectionInformation[collection].items &&
                    collectionInformation[collection].items.map((nft, i) => (
                        <div
                          key={i}
                          className="border shadow rounded-xl overflow-hidden"
                        >
                          <img class="w-full aspect-square" alt="" src={nft.image} />
                          <div className="p-4">
                            <p
                              style={{ height: "64px" }}
                              className="text-2xl font-semibold"
                            >
                              {nft.name}
                            </p>
                            <div style={{ height: "70px", overflow: "hidden" }}>
                              <p className="text-gray-400">{nft.description}</p>
                            </div>
                          </div>
                          <div className="p-4 bg-black bottom">
                            <p className="text-2xl mb-4 font-bold text-white">
                              {nft.price} ETH
                            </p>
                            <button
                              className="w-full bg-pink-500 text-white font-bold py-2 px-12 rounded"
                              onClick={() => buyNft(nft)}
                            >
                              {nft.isAuction && nft.isAuction ? "Bid" : "Buy"}
                            </button>
                          </div>
                        </div>
                    ))}
                </div>
              </div>
            ))}
        </div>
      </div>
    </>
  );
}
