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
import { Link } from "react-router-dom";

export default function CreatorDashboard() {
  const [collections, setCollections] = useState([]);
  const [nfts, setNfts] = useState([]);
  const [sold, setSold] = useState([]);
  const [loadingState, setLoadingState] = useState("not-loaded");
  const [collectionloadingState, setCollectionLoadingState] =
    useState("not-loaded");
  useEffect(() => {
    loadNFTs()
    loadCollections();
  }, []);

  async function loadCollections() {
    try {
      const web3Modal = new Web3Modal({
        network: "mainnet",
        cacheProvider: true,
      });
      const connection = await web3Modal.connect();
      const provider = new ethers.providers.Web3Provider(connection);
      const signer = provider.getSigner();
      const address = signer.provider.provider.selectedAddress;
      // console.log(signer.provider.provider.selectedAddress)
      const FactoryContract = new ethers.Contract(
        factoryaddress,
        Factory.abi,
        signer
      );
      const NumberOfCollections = await FactoryContract.collections(address);
      console.log('NumberOfCollections', NumberOfCollections);
      let listOfCollections = [];
      for (let index = 0; index < NumberOfCollections.toNumber(); index++) {
        let itm = await FactoryContract.ownerIdToCollection(address, index);
        listOfCollections.push(itm);
      }
      console.log("listofcoll", listOfCollections);

      let collectionObj = await Promise.all(
        listOfCollections.map(async (address) => {
          const CollectionContract = new ethers.Contract(
            address,
            Collection.abi,
            provider
          );
          const name = await CollectionContract.name();
          const symbol = await CollectionContract.symbol();
          return {
            name,
            symbol,
            address
          };
        })
      );

      setCollections(collectionObj);
      setCollectionLoadingState("loaded");
    } catch (error) {
      console.log("erro", error);
    }
  }

  async function loadNFTs() {
    try {
    const web3Modal = new Web3Modal()
    const connection = await web3Modal.connect()
    const provider = new ethers.providers.Web3Provider(connection)
    const signer = provider.getSigner()

    const marketContract = new ethers.Contract(nftmarketaddress, Market.abi, signer)
    const tokenContract = new ethers.Contract(nftaddress, NFT.abi, provider)
    const data = await marketContract.fetchItemsCreated()
    const items = await Promise.all(data.map(async i => {
      let id = i.tokenId.toNumber()
      console.log("id", id)
      const tokenUri = await tokenContract.tokenURI(i.tokenId.toNumber())
      console.log("uri", tokenUri)
      const meta = await axios.get(tokenUri)
      let price = ethers.utils.formatUnits(i.price.toString(), 'ether')
      let item = {
        price,
        tokenId: i.tokenId.toNumber(),
        seller: i.seller,
        owner: i.owner,
        sold: i.sold,
        image: meta.data.image,
      }
      console.log("item", item)
      return item
    }))
    /* create a filtered array of items that have been sold */
    const soldItems = items.filter(i => i.sold)
    setSold(soldItems)
    setNfts(items)
    setLoadingState('loaded')
  } catch (error) {
     console.log("erro", error)
  }
  }
  return (
    <div>
      {loadingState === "loaded" && !nfts.length ? (
        <h1 className="py-10 px-20 text-3xl">No NFTs created</h1>
      ) : (
        <>
          <div className="p-4">
            <h2 className="text-2xl py-2">NFTs Created</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-4">
              {nfts.map((nft, i) => (
                <div
                  key={i}
                  className="border shadow rounded-xl overflow-hidden"
                >
                  <img src={nft.image} className="rounded" />
                  <div className="p-4 bg-black">
                    <p className="text-2xl font-bold text-white">
                      Price - {nft.price} Eth
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="px-4">
            {Boolean(sold.length) && (
              <div>
                <h2 className="text-2xl py-2">Items sold</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-4">
                  {sold.map((nft, i) => (
                    <div
                      key={i}
                      className="border shadow rounded-xl overflow-hidden"
                    >
                      <img src={nft.image} className="rounded" />
                      <div className="p-4 bg-black">
                        <p className="text-2xl font-bold text-white">
                          Price - {nft.price} Eth
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </>
      )}

      {collectionloadingState === "loaded" && !collections.length ? (
        <h1 className="py-10 px-20 text-3xl">No NFTs created</h1>
      ) : (
        <>
          <div className="p-4">
            <h2 className="text-2xl py-2">Collections Created</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-4">
              {collections.map((itm, i) => (
                <div
                  key={i}
                  className="border shadow rounded-xl overflow-hidden"
                >
                  {/* <img src={itm.name} className="rounded" /> */}
                <Link to={`/collection-detail/${itm.address}`}>
                <div className="p-4 bg-white">
                    <p className="text-2xl font-bold text-black">
                   <p>Name: {itm.name}</p>  
                    <p>Symbol: {itm.symbol}</p> 
                    </p>
                  </div>
                </Link>
          
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
