const assert = require("assert")

const DappFactory = require("../../Base/src/DappFactory")

module.exports = class WeatherInsuranceFactory extends DappFactory{
	constructor(web3){
		super(web3, __dirname + "/../contracts/WeatherInsurer.sol")

		this.build("main:WeatherInsurance")

		this.writeAbi(__dirname + "/../WeatherInsuranceAbi.json")
	}
}