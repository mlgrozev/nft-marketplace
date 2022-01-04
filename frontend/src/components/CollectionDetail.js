import { useState, useEffect } from "react";
import { ethers } from "ethers";
import { create as ipfsHttpClient } from "ipfs-http-client";
import { useNavigate, useParams } from "react-router";
import Web3Modal from "web3modal";
import axios from "axios";
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
const client = ipfsHttpClient("https://ipfs.infura.io:5001/api/v0");
function CollectionDetail() {
  // const navigate = useNavigate()
  const [tripType, setTripType] = useState(false);
  const [endingUnix, setEndingUnix] = useState(0);
  const [error, setError] = useState();
  const [fileUrl, setFileUrl] = useState(null);
  const [formInput, updateFormInput] = useState({
    price: "",
    name: "",
    description: "",
  });
  const { id } = useParams();
  const [collections, setCollections] = useState([]);
  const [modalstate, setModalstate] = useState(false);
  const [nfts, setNfts] = useState([]);
  const [sold, setSold] = useState([]);
  const [loadingState, setLoadingState] = useState("not-loaded");
  const [collectionloadingState, setCollectionLoadingState] =
    useState("not-loaded");

  useEffect(() => {
    loadData();
    loadNFTS();
    //   loadCollections();
  }, []);

  async function onChange(e) {
    const file = e.target.files[0];
    try {
      const added = await client.add(file, {
        progress: (prog) => console.log(`received: ${prog}`),
      });
      const url = `https://ipfs.infura.io/ipfs/${added.path}`;
      setFileUrl(url);
    } catch (error) {
      setError(`Error uploading file: ${error}`);
      console.log("Error uploading file: ", error);
    }
  }
  async function create() {
    setError("");
    const { name, description, price } = formInput;
    if (!name || !description || !price || !fileUrl)
      return setError("Kindly provide the required fields");
    /* first, upload to IPFS */
    const data = JSON.stringify({
      name,
      description,
      image: fileUrl,
    });
    try {
      const added = await client.add(data);
      const url = `${added.path}`;
      /* after file is uploaded to IPFS, pass the URL to save it on Polygon */
      createNFT(url);
    } catch (error) {
      setError(`Error uploading file: ${error}`);
      console.log("Error uploading file: ", error);
    }
  }

  async function createNFT(url) {
    let signer;
    try {
      const web3Modal = new Web3Modal();
      const connection = await web3Modal.connect();
      const provider = new ethers.providers.Web3Provider(connection);
      signer = provider.getSigner();
    } catch (error) {
      setError(`Error uploading file: ${JSON.stringify(error)}`);
      console.log("error", error);
    }

    try {
      /* next, create the item */
      let contract = new ethers.Contract(nftaddress, NFT.abi, signer);
      let transaction = await contract.createToken(url);
      let tx = await transaction.wait();
      let event = tx.events[0];
      let value = event.args[2];
      let tokenId = value.toNumber();
     
      const price = ethers.utils.parseUnits(formInput.price, "ether");

      /* then list the item for sale on the marketplace */
      contract = new ethers.Contract(nftmarketaddress, Market.abi, signer);
      let listingPrice = await contract.getListingPrice();
      console.log('listingPriceORG', listingPrice)
      listingPrice = listingPrice.toString();
      console.log('listingPrice', listingPrice)
      console.log('nftaddress', nftaddress);
      console.log('tokenId', tokenId);
      console.log('price', price);
      console.log('tripType', tripType);
      console.log('endingUnix', endingUnix);
      console.log('listingPrice', listingPrice);
      transaction = await contract.createMarketItem(
        nftaddress,
        tokenId,
        price,
        tripType,
        endingUnix,
        {
          value: listingPrice,
        }
      );
      await transaction.wait();
      setModalstate(false);
    } catch (error) {
      setError(`${error.message}`);
      console.log("error", error);
    }
  }

  async function loadData() {
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
      const CollectionContract = new ethers.Contract(
        id,
        Collection.abi,
        provider
      );
      const name = await CollectionContract.name();
      const symbol = await CollectionContract.symbol();
      let collectionObj = {
        name,
        symbol,
        address,
      };

      setCollections(collectionObj);
      setLoadingState("loaded");
    } catch (error) {
      console.log("erro", error);
    }
  }

  async function loadNFTS() {
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
      const tokenContract = new ethers.Contract(nftaddress, NFT.abi, provider);
      const CollectionContract = new ethers.Contract(
        collectionaddress,
        Collection.abi,
        signer
      );
      let ids = await CollectionContract.balanceOf(address);
      //  ids =  ids.toNumber()
      //  ids = ids.toString()
      console.log("id", ids.toNumber());
      let items = [];
      for (let index = 1; index <= ids.toNumber(); index++) {
        try {
          console.log("tokurirann");
          const tokenUri = await CollectionContract.tokenURI(index.toString());
          console.log("tokuri", tokenUri);
          const meta = await axios.get(tokenUri);
          console.log("meta", meta);
          let item = {
            // price,
            tokenId: index.toString(),
            image: meta.data.image,
          };
          items.push(item);
        } catch (error) {
          console.log("err uri", error);
        }
      }
      setNfts(items);
      setLoadingState("loaded");
    } catch (error) {
      console.log("erro", error);
    }
  }

  return (
    <div
      className="flex justify-center "
      style={{ flexDirection: "column", width: "100%" }}
    >
      <p className="py-1 px-10 text-3xl">{collections.name}</p>
      <p className="py-1 px-10 text-3xl">{collections.symbol}</p>
      <button
        className="py-5 px-10 text-1xl bg-red-300 text-white text-center w-40"
        style={{ margin: "0 auto" }}
        onClick={() => {
          setModalstate(true);
        }}
      >
        Mint NFTs
      </button>
      <div className="flex justify-center">
        <div className="p-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-4">
            {nfts.map((nft, i) => (
              <div key={i} className="border shadow rounded-xl overflow-hidden">
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
      </div>

      <div className={modalstate ? "mintmodal" : "none"}>
        <div className="modal-content">
          <span
            onClick={() => {
              setModalstate(false);
            }}
            className="close"
          >
            &times;
          </span>
          <h1 className="text-center text-5xl font-bold bg-white">
            Create NFTs
          </h1>
          <div className="flex justify-center">
            <div className="w-1/2 flex flex-col pb-12">
              <p>{error}</p>
              <input
                placeholder="Asset Name"
                className="mt-8 border rounded p-4"
                onChange={(e) =>
                  updateFormInput({ ...formInput, name: e.target.value })
                }
              />
              <textarea
                placeholder="Asset Description"
                className="mt-2 border rounded p-4"
                onChange={(e) =>
                  updateFormInput({ ...formInput, description: e.target.value })
                }
              />
              <input
                placeholder="Asset Price in Eth"
                className="mt-2 border rounded p-4"
                onChange={(e) =>
                  updateFormInput({ ...formInput, price: e.target.value })
                }
              />
              <input
                type="file"
                name="Asset"
                className="my-4"
                onChange={onChange}
              />
              {fileUrl && (
                <img className="rounded mt-4" width="350" src={fileUrl} />
              )}
              <div className="radio-btn-container">
                <div
                  className="radio-btn"
                  onClick={() => {
                    setTripType(false);
                  }}
                >
                  <input
                    type="radio"
                    value={tripType}
                    name="tripType"
                    checked={tripType == false}
                  />
                  Sale
                </div>
                <div
                  className="radio-btn"
                  onClick={() => {
                    setTripType(true);
                  }}
                >
                  <input
                    type="radio"
                    value={tripType}
                    name="tripType"
                    checked={tripType == true}
                  />
                  Auction
                </div>
              </div>
              {tripType && (
                <input
                  placeholder="_endingUnix"
                  className="mt-2 border rounded p-4"
                  onChange={(e) => setEndingUnix(e.target.value)}
                />
              )}

              <button
                onClick={create}
                className="font-bold mt-4 bg-pink-500 text-white rounded p-4 shadow-lg"
              >
                Create Digital Asset
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CollectionDetail;
