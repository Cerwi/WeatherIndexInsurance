const assert = require("assert")
const Web3 = require("web3")

const Contract = require("./Contract")

module.exports = class DeployableContract extends Contract{
	constructor(web3, abi, bytecode){
		assert(web3)
		assert(abi)
		assert(bytecode)

		super(new web3.eth.Contract(abi, null, { data: bytecode}))
	}

	async deploy(from, gas, gasPrice){
		assert(from)
		assert(gas)
		assert(gasPrice)

		return await this.contract.deploy().send({
		    from: from,
		    gas: gas,
		    gasPrice: gasPrice
		})/*.on("error", function(error){
			console.log("error" + error)
		}).on("transactionHash", function(transactionHash){
			console.log("transactionHash")
		}).on("receipt", function(receipt){
			console.log("receipt")
			//.log(receipt.contractAddress) // contains the new contract address
		}).on("confirmation", function(confirmationNumber, receipt){
			//console.log("confirmation")
		})*/
	}
}