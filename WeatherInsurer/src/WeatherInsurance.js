const assert = require("assert")

const SimpleDapp = require("../../Base/src/SimpleDapp")

module.exports = class WeatherInsurance extends SimpleDapp{
	constructor(web3, account, abi, address){
		super(web3, account, abi, address)
	}

	async getDurationUntilEndtime(){
		return await this.contract.methods.getDurationUntilEndtime().call()
	}

	async getNumDaysBelowTresholdTemperature(){
		return await this.contract.methods.getNumDaysBelowTresholdTemperature().call()
	}

	async checkClaim(){
		await this.contract.methods.checkClaim().send({from: this.account, gas: 4500000, gasPrice:"3000000000000"})
	}
}