const assert = require("assert")
const fs = require("fs")

const ContractCompiler = require("../../Base/src/ContractCompiler")
const Dapp = require("../../Base/src/Dapp")

module.exports = class DappFactory extends Dapp{
	constructor(web3, fileName){
		super(web3)

		this.compiler = new ContractCompiler()
		this.compiler.compile(fileName)
	}

	build(contractName, fileName){
		let contractData = this.compiler.getContractData(contractName)

		this.abi = contractData.abi
		this.bytecode = contractData.bytecode
	}

	writeAbi(fileName){
		console.log(`Writing abi to ${fileName}`)

		let data = JSON.stringify(this.abi)

		fs.writeFileSync(fileName, data)
	}

	slice(args, start, end){
		let array = []
		for (let i = start; i < end; i++){
			array[i - start] = args[i]
		}

		return array
	}

	async deploy(account, gas, gasPrice){
		let contract = new this.web3.eth.Contract(this.abi, null, { data: this.bytecode })

		let deployArguments = this.slice(arguments, 3, arguments.length - 1)

		let contractInstance = await contract.deploy({arguments: deployArguments}).send({
		    from: account,
		    gas: gas,
		    gasPrice: gasPrice
		})

		return contractInstance.options.address
	}

	writeAddress(fileName, address){
		console.log(`Writing address to ${fileName}`)

		let data = JSON.stringify({address: address})

		fs.writeFileSync(fileName, data)
	}
}