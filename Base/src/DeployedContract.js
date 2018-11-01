const assert = require("assert")
const Web3 = require("web3")

const Contract = require("./Contract")

module.exports = class DeployedContract extends Contract{
	constructor(web3, abi, address){
		assert(web3)
		assert(abi)
		assert(address)

		super(new web3.eth.Contract(abi, address))
	}
}