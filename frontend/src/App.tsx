import React, { useEffect, useState } from 'react'
import { Button } from 'react-bootstrap'
import 'bootstrap/dist/css/bootstrap.min.css'
import './App.css'
import Web3 from 'web3'
import { Contract } from 'web3-eth-contract'
import { AbiItem } from 'web3-utils'
import { CONTRACT_ABI, CONTRACT_ADDRESS } from './contract/index'

function App() {
  const [account, setAccount] = useState<null | string>(null)
  const [mintAmount, setMintAmount] = useState<string>('1')
  const [contract, setContract] = useState<Contract | null>(null)

  const connectWallet = async () => {
    try {
      if ((window as any).ethereum) {
        let web3 = new Web3((window as any).ethereum)
        let accounts = await web3.eth.getAccounts()
        let account = accounts[0]
        setAccount(account)
        let nftMintingContract = new web3.eth.Contract(
          CONTRACT_ABI as AbiItem[],
          CONTRACT_ADDRESS,
        )
        if (nftMintingContract) {
          setContract(nftMintingContract)
        }
      } else {
        throw 'No wallet found'
      }
    } catch (err) {
      console.log('Error in connect wallet', err)
    }
  }

  const mintNft = async () => {
    try {
      let mintRate = Number(await contract?.methods.cost().call())
      var totalAmount = Number(mintAmount) * mintRate
      await contract?.methods.mint(account, mintAmount).send({
        from: account,
        value: String(totalAmount),
      })
    } catch (err) {
      console.log('Error during mintNft', err)
    }
  }

  return (
    <div className="App">
      <div className="container">
        <div className="row">
          <form
            className="gradient col-lg-5 mt-5 p-3 "
            style={{ borderRadius: '25px', boxShadow: '1px 1px 14px black' }}
          >
            <h4 style={{ color: 'white' }}>Mint Portal </h4>
            <h5 style={{ color: 'white' }}>Please connect your wallet</h5>
            <Button
              onClick={connectWallet}
              style={{ marginBottom: '5xp', color: 'white' }}
            >
              Connect Wallet
            </Button>
            <div
              style={{ marginTop: '5px', boxShadow: '1px 1px 4px #000000' }}
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
            <label className="pt-2" style={{ color: 'white' }}>
              Price 0.05 ETH each mint
            </label>
          </form>
        </div>
      </div>
    </div>
  )
}

export default App
