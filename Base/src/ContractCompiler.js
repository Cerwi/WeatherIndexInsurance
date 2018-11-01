const assert = require("assert")
const solc = require("solc")
const fs = require("fs")

const DeployableContract = require("./DeployableContract")

module.exports = class ContractCompiler{
	compile(fileName){
		assert(fileName)

		console.log(`Compiling contract ${fileName}`)

		let input = {
			main: fs.readFileSync(fileName, "utf8"),
		}

		this.output = solc.compile({ sources: input }, 1, function(path){
			return { contents: fs.readFileSync(path, "utf8")}
		})


		for (let error in this.output.errors){
			console.log(`Error ${this.output.errors[error]}`)
		}

		assert(this.output)

		for (let contractName in this.output.contracts){
			console.log(`Compiled contract ${contractName}`)
		}
	}

	getContractData(contractName){
		let contract = this.output.contracts[contractName]
		assert(contract)

		let abi = JSON.parse(contract.interface)
		assert(abi)

		let bytecode = contract.bytecode
		assert(bytecode)

		return {abi:abi, bytecode:bytecode}
	}

	// deprecated
	getDeployableContract(web3, contractName){
		assert(web3)
		assert(contractName)

		let contractData = this.getContractData(contractName)

		return new DeployableContract(web3, contractData.abi, contractData.bytecode)
	}

	// deprecated
	async deployContract(web3, contractName, account, gas, gas2){
		let contract = this.getDeployableContract(web3, contractName)

		let instance = await contract.deploy(account, gas, gas2)

		return instance
	}
}