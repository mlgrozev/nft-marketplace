import { useState } from "react";
import { ethers } from "ethers";
import { create as ipfsHttpClient } from "ipfs-http-client";
import { useNavigate } from "react-router";
import Web3Modal from "web3modal";
import {
  nftaddress,
  nftmarketaddress,
  factoryaddress,
  collectionaddress,
} from "../config";
import Market from "./../artifacts/contracts/Market.sol/Market.json";
import NFT from "./../artifacts/contracts/NFT.sol/NFT.json";

const client = ipfsHttpClient("https://ipfs.infura.io:5001/api/v0");

export default function CreateItem() {
  const [tripType, setTripType] = useState(false);
  const [endingUnix, setEndingUnix] = useState(0);

  const navigate = useNavigate();
  const [error, setError] = useState();
  const [fileUrl, setFileUrl] = useState(null);
  const [formInput, updateFormInput] = useState({
    price: "",
    name: "",
    description: "",
  });

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
  async function createMarket() {
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
      createSale(url);
    } catch (error) {
      setError(`Error uploading file: ${error}`);
      console.log("Error uploading file: ", error);
    }
  }

  async function createSale(url) {
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
      listingPrice = listingPrice.toString();
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
      navigate("/collection-detail/" + nftaddress);
    } catch (error) {
      setError(`${error.message}`);
      console.log("error", error);
    }
  }
  console.log("end", endingUnix);
  return (
    <>
      <h1 className="text-center text-5xl font-bold bg-white">Create NFTs</h1>
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
            onClick={createMarket}
            className="font-bold mt-4 bg-pink-500 text-white rounded p-4 shadow-lg"
          >
            Create Digital Asset
          </button>
        </div>
      </div>
    </>
  );
}
