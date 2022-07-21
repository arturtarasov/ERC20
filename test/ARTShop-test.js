const { expect } = require("chai")
const { ethers } = require("hardhat")
const tokenJSON = require("../artifacts/contracts/ERC20.sol/ARTURToken.json")

describe("ARTShop", function () {
    let owner
    let buyer
    let shop
    let erc20

    beforeEach(async function() {
        [owner, buyer] = await ethers.getSigners()

        const ARTShop = await ethers.getContractFactory("ARTShop", owner)
        shop = await ARTShop.deploy()
        await shop.deployed()

        erc20 = new ethers.Contract(await shop.token(), tokenJSON.abi, owner)
    })

    it("should have an owner and a token", async function() {
        expect(await shop.owner()).to.eq(owner.address)
  
        expect(await shop.token()).to.be.properAddress
    })

    it("allows to buy", async function() {
        const tokenAmount = 3
  
        const txData = {
          value: tokenAmount,
          to: shop.address
        }
  
        const tx = await buyer.sendTransaction(txData)
        await tx.wait()
  
        expect(await erc20.balanceOf(buyer.address)).to.eq(tokenAmount)
  
        await expect(() => tx).
          to.changeEtherBalance(shop, tokenAmount)
  
        await expect(tx)
          .to.emit(shop, "Bought")
          .withArgs(tokenAmount, buyer.address)
    })
})