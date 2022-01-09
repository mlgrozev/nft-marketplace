import React from 'react'
import { useState } from "react";
import { ethers } from "ethers";
import { create as ipfsHttpClient } from "ipfs-http-client";
import { useNavigate } from 'react-router'
import Web3Modal from "web3modal";
import { nftaddress, nftmarketaddress , factoryaddress, collectionaddress} from "../config";
import Factory from "./../artifacts/contracts/Factory.sol/Factory.json";

const client = ipfsHttpClient("https://ipfs.infura.io:5001/api/v0");

export default function Collections () {
  const navigate = useNavigate()
  const [error, setError] = useState()

      const [formInput, updateFormInput] = useState({
        name: "",
        symbol: "",
      });

      async function createCollection() {
        setError("")
        const { name, symbol } = formInput;
        if (!name || !symbol) return setError("Kindly provide the required fields");
        try {
        const web3Modal = new Web3Modal();
        const connection = await web3Modal.connect();
        const provider = new ethers.providers.Web3Provider(connection);
        const signer = provider.getSigner();
    
      //   /* next, create the Collection */

        let contract = new ethers.Contract(factoryaddress, Factory.abi, signer);
        let transaction = await contract.createCollection(name,symbol,"https://ipfs.infura.io/ipfs/");
        let tx = await transaction.wait();
        console.log("tx", tx)
        navigate('/creator-dashboard')
        } catch (error) {
          setError(`${error.message}`)
          console.log("error", error)
        }
      }
    
    
      return (
        <>
    <h1 className="text-center text-5xl font-bold bg-white">Create a Collection</h1>
        <div className="flex justify-center">
        
          <div className="w-1/2 flex flex-col pb-12">
          <p>{error}</p>
            <input
              placeholder="Collection Name"
              className="mt-8 border rounded p-4"
              onChange={(e) =>
                updateFormInput({ ...formInput, name: e.target.value })
              }
            />
            <textarea
              placeholder="Collection Symbol"
              className="mt-2 border rounded p-4"
              onChange={(e) =>
                updateFormInput({ ...formInput, symbol: e.target.value })
              }
              />
            <button
              onClick={createCollection}
              className="font-bold mt-4 bg-pink-500 text-white rounded p-4 shadow-lg hover:bg-pink-700"
            >
              Create NFT Collection
            </button>
          </div>
        </div>
                </>
      );
    }

