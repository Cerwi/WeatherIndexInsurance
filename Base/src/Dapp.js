const assert = require("assert")
const fs = require("fs")
const Web3 = require("web3")

const DeployedContract = require("./DeployedContract")

module.exports = class Dapp{
	constructor(web3){
		this.web3 = web3
	}

	/*destroy(){
		if (this.web3){
			this.web3.currentProvider.connection.close()
			this.web3 = null
		}
	}*/

	async getAccounts(){
		return await this.web3.eth.getAccounts()
	}

	static loadAbi(fileName){
		return JSON.parse(fs.readFileSync(fileName, "utf8"))
	}

	static loadAddress(fileName){
		let data = JSON.parse(fs.readFileSync(fileName, "utf8"))

		return data.address
	}

	loadContract(abi, address){
		return new DeployedContract(this.web3, abi, address)
	}
}