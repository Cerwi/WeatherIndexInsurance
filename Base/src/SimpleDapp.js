const assert = require("assert")

const Dapp = require("./Dapp")

module.exports = class SimpleDapp extends Dapp{
	constructor(web3, account, abi, address){
		super(web3)
		
		assert(account)
		assert(abi)
		assert(address)

		this.account = account
		this.contract = this.loadContract(abi, address)
	}

	get address(){
		return this.contract.options.address
	}
}