const assert = require("assert")

const DappFactory = require("../../Base/src/DappFactory")

module.exports = class WeatherOracleFactory extends DappFactory{
	constructor(web3){
		super(web3, __dirname + "/../contracts/WeatherOracle.sol")

		this.build("main:WeatherOracle")

		this.writeAbi(__dirname + "/../WeatherOracleAbi.json")
	}

	async deploy(account, gas, gasPrice){
		let address = await super.deploy(account, gas, gasPrice)

		this.writeAddress(__dirname + "/../WeatherOracleAddress.json", address)
	}
}