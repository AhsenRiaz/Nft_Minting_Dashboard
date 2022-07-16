import React, { useEffect, useState } from "react";
import { Button } from "react-bootstrap";
import "bootstrap/dist/css/bootstrap.min.css";
import "./App.css";
import Web3 from "web3";
import { Contract } from "web3-eth-contract";
import { AbiItem } from "web3-utils";
import { CONTRACT_ABI, CONTRACT_ADDRESS } from "./contract/index";
import axios from "axios";
require("dotenv").config();

interface NftDataType {
  tokenID: string;
  to: string;
  tokenName: string;
  tokenSymbol: string;
  contractAddress: string;
  hash: string;
}

function App() {
  const [account, setAccount] = useState<null | string>(null);
  const [mintAmount, setMintAmount] = useState<string>("1");
  const [contract, setContract] = useState<Contract | null>(null);
  const [totalSupply, setTotalSupply] = useState<null | string>(null);
  const [nftData, setNftData] = useState<NftDataType[]>([]);

  const apiKey = "XIMXRY76FWU5NPZX2FVRI6Y9D2DQRCJPD8";
  const apiEndpoint = "https://api-rinkeby.etherscan.io/api";
  const nftPng =
    "https://gateway.pinata.cloud/ipfs/QmWZMa3m8zgdXcPLDJrJcXybekhAEKboEXkmqA6LLmAg4g/";

  useEffect(() => {
    const getTokenDetails = async () => {
      try {
        const getTokenSupply = await axios.get(
          apiEndpoint +
            `?module=stats&action=tokensupply&contractaddress=${CONTRACT_ADDRESS}&apikey=${apiKey}`
        );

        const getNftData = await axios.get(
          apiEndpoint +
            `?module=account&action=tokennfttx&contractaddress=${CONTRACT_ADDRESS}&page=1&offset=100&tag=latest&sort=asc&apikey=${apiKey}`
        );
        console.log("getNftData", getNftData);
        if (
          getTokenSupply.data &&
          getTokenSupply.data.result &&
          getNftData.data &&
          getNftData.data.result
        ) {
          setTotalSupply(getTokenSupply.data.result);
          setNftData(getNftData.data.result);
        }
      } catch (err) {
        console.log("Error", err);
      }
    };

    getTokenDetails().catch(console.error);
  }, []);

  const connectWallet = async () => {
    try {
      if ((window as any).ethereum) {
        let web3 = new Web3((window as any).ethereum);
        let accounts = await web3.eth.getAccounts();
        let account = accounts[0];
        setAccount(account);
        let nftMintingContract = new web3.eth.Contract(
          CONTRACT_ABI as AbiItem[],
          CONTRACT_ADDRESS
        );
        if (nftMintingContract) {
          setContract(nftMintingContract);
        }
      } else {
        throw Error("No wallet found");
      }
    } catch (err) {
      console.log("Error in connect wallet", err);
    }
  };

  const mintNft = async () => {
    try {
      let mintRate = Number(await contract?.methods.cost().call());
      var totalAmount = Number(mintAmount) * mintRate;
      let owner = await contract?.methods.owner().call();
      await contract?.methods.mint(account, mintAmount).send({
        from: account,
        value: account === owner ? String(0) : String(totalAmount),
      });
    } catch (err) {
      console.log("Error during mintNft", err);
    }
  };

  const withdraw = async () => {
    try {
      let owner = await contract?.methods.owner().call();
      console.log("owner", owner);
      await contract?.methods.withdraw().send({
        from: account,
      });
    } catch (err) {
      console.log("Error in withdraw function", err);
    }
  };

  return (
    <div className="App">
      <div className="container">
        <div className="row">
          <form
            className="gradient col-lg-5 mt-5 p-3 "
            style={{ borderRadius: "25px", boxShadow: "1px 1px 14px black" }}
          >
            <h4 style={{ color: "white" }}>Mint Portal </h4>
            <h5 style={{ color: "white" }}>Please connect your wallet</h5>
            <Button
              onClick={connectWallet}
              style={{ marginBottom: "5xp", color: "white" }}
            >
              {account ? "Connected" : "Connect Wallet"}
            </Button>
            <Button onClick={withdraw} style={{ marginLeft: "1rem" }}>
              Withdraw
            </Button>
            <div
              style={{ marginTop: "5px", boxShadow: "1px 1px 4px #000000" }}
              className="card"
              id="wallet-address"
            >
              <label className="gradientFont" htmlFor="floatingInput">
                Wallet Address {account}
              </label>
              <input
                className="gradientFont"
                type="number"
                name="amount"
                defaultValue={mintAmount}
                value={mintAmount}
                onChange={(e) => setMintAmount(e.target.value)}
                min="1"
                max="5"
              />
              <label className="gradientFont">
                Please select the amount of NFTs to mint.
              </label>
              <Button onClick={mintNft}>Mint/Buy</Button>
            </div>
            <label className="pt-2" style={{ color: "white" }}>
              Price 0.05 ETH each mint <br />
              {totalSupply} nfts sold out of 1000 nfts
            </label>
          </form>
        </div>
        <div className="row items showNFTs">
          <h1 className="mt-2" style={{ color: "white" }}>
            Nfts Sold
          </h1>
          {nftData &&
            nftData.map((arr, i) => {
              console.log("i", i);
              return (
                <div className="col-lg-3 col-md-4 col-sm-6  nftcard">
                  <div className="image-over mt-3">
                    <img
                      width={150}
                      height={150}
                      className="card-img-top"
                      src={nftPng + arr.tokenID + ".jpeg"}
                      alt=""
                    />
                  </div>
                  <div className="card-caption col-12 ">
                    <div className="card-body">
                      <div style={{ textAlign: "left" }}>
                        <h5
                          style={{
                            fontSize: "12px",
                            color: "#39FF14",
                            fontWeight: "bold",
                            textShadow: "1px 1px 2px #000000",
                          }}
                          className="mb-0"
                        >
                          Name: {arr.tokenName}
                        </h5>
                        <h5
                          style={{
                            fontSize: "12px",
                            color: "#39FF14",
                            fontWeight: "bold",
                            textShadow: "1px 1px 2px #000000",
                          }}
                          className="mb-0"
                        >
                          Symbol: {arr.tokenSymbol}
                        </h5>
                        <h5
                          style={{
                            fontSize: "12px",
                            color: "#39FF14",
                            fontWeight: "bold",
                            textShadow: "1px 1px 2px #000000",
                          }}
                          className="mb-0"
                        >
                          Token Id{arr.tokenID}
                        </h5>
                        <p
                          style={{
                            fontSize: "12px",
                            color: "#39FF14",
                            fontWeight: "bold",
                            textShadow: "1px 1px 2px #000000",
                          }}
                        >
                          Owner: {arr.to}
                        </p>
                      </div>
                      <div className="card-bottom d-flex justify-content-between">
                        <Button className="btn btn-bordered-white btn-smaller mt-3">
                          <i className="mr-2">Buy Now</i>
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
        </div>
      </div>
    </div>
  );
}

export default App;
