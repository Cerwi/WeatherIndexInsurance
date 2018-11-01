const assert = require("assert")

const DappFactory = require("../../Base/src/DappFactory")

module.exports = class WeatherInsurerFactory extends DappFactory{
	constructor(web3){
		super(web3, __dirname + "/../contracts/WeatherInsurer.sol")

		this.build("main:WeatherInsurer")

		this.writeAbi(__dirname + "/../WeatherInsurerAbi.json")
	}

	async deploy(account, gas, gasPrice, arg0, arg1, arg2){
		let address = await super.deploy(account, gas, gasPrice, arg0, arg1, arg2)

		this.writeAddress(__dirname + "/../WeatherInsurerAddress.json", address)

		return address
	}
}