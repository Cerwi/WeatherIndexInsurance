const assert = require("assert")

const DappFactory = require("../../Base/src/DappFactory")

module.exports = class SmartBankFactory extends DappFactory{
	constructor(web3){
		super(web3, __dirname + "/../contracts/SmartBank.sol")

		this.build("main:SmartBank")

		this.writeAbi(__dirname + "/../SmartBankAbi.json")
	}

	async deploy(account, gas, gasPrice){
		let address = await super.deploy(account, gas, gasPrice)

		this.writeAddress(__dirname + "/../SmartBankAddress.json", address)
	}
}