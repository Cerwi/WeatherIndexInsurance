const assert = require("assert")

const SimpleDapp = require("../../Base/src/SimpleDapp")

const WeatherInsurance = require("./WeatherInsurance")

module.exports = class WeatherInsurer extends SimpleDapp{
	constructor(web3, account, abi, address){
		super(web3, account, abi, address)

		this.contract.events.Debug({}, async function(error, message){
			//console.log("event received")
			//console.log(message)
		})
	}

	async createInsurance(policyInput, iban){
		let response = await this.contract.methods.createInsurance(policyInput, iban).send({from: this.account, gas: 4500000, gasPrice:"3000000000000"})

		let insuranceAbi = WeatherInsurer.loadAbi(__dirname + "/../WeatherInsuranceAbi.json")
		let insuranceAddress = response.events.InsuranceCreated.returnValues[0]

		return new WeatherInsurance(this.web3, this.account, insuranceAbi, insuranceAddress)
	}
}