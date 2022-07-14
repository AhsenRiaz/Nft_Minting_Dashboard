// SPDX-License-Identifier: GPL-3.0
pragma solidity ^0.8.1;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import "@openzeppelin/contracts/utils/Strings.sol";
contract MyNFT is ERC721Enumerable, Ownable {
    using Strings for uint256;
    string public baseURI;
    string public baseExtension = ".json";
    uint256 public cost = 0.05 ether;
    uint256 public maxSupply = 1000;
    uint256 public maxMintAmount = 5;
    bool public paused = false;

    constructor(string memory _name, string memory _symbol) ERC721(_name, _symbol) {
       
    }

    function _baseURI() internal view virtual override returns(string memory){
        return "ipfs://QmUnyBNR5G1vGjTdMRvrxijPrCm4gZL3WLQnmZHXmc7wjd/";
    }

    function mint(address to_ , uint256 mintAmount_ ) payable public {
        uint256 totalSupply = totalSupply();
        require(!paused , "MyNFT: minting paused");
        require(mintAmount_ > 0 , "MyNFT: mintAmount < 0");
        require(mintAmount_ <= maxMintAmount , "MyNFT: mintAmount > maxMintAmount");
        require(totalSupply + mintAmount_ <= maxSupply , "MyNFT: totalSupply > maxSupply");

        if(_msgSender() != owner()){
            require(msg.value == mintAmount_ * cost , "MyNFT: fees < required");
        }

        for(uint i = 1; i <= mintAmount_; i++){
            _safeMint(to_ , totalSupply + i);
        }

    }

    function walletOfOwner(address owner_) public view returns (uint256[] memory) {
        uint256 ownerTokenCount = balanceOf(owner_);
        uint256[] memory tokenIds = new uint256[](ownerTokenCount);

        for(uint i; i<ownerTokenCount; i++){
            tokenIds[i] = tokenOfOwnerByIndex(owner_,i);
        }
        return tokenIds;
    }

    function tokenURI(uint256 tokenId) public virtual override view returns(string memory){
        require(_exists(tokenId) , "URI query for nonexistant token");
        string memory currentBaseURI = _baseURI();
        return 
        bytes(currentBaseURI).length > 0 
        ? string(abi.encodePacked(currentBaseURI, tokenId.toString(), baseExtension))
        : "";
    }

    // onlyOwner
    function setMaxMintAmount(uint256 _newMaxMintAmount) public onlyOwner(){
        maxMintAmount = _newMaxMintAmount;
    }

    function setBaseURI(string memory _newBaseURI) public onlyOwner(){
        baseURI = _newBaseURI;
    }

    function setBaseExtension(string memory _newExtension) public onlyOwner(){
        baseExtension = _newExtension;
    }

    function pause(bool _state) public onlyOwner(){
        paused = _state;
    }

    function withdraw() payable public onlyOwner(){
       payable(msg.sender).transfer(address(this).balance);
    }

}
