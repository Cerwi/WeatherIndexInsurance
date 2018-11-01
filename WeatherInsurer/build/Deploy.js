const Web3 = require("web3")

const WeatherInsurerFactory = require("./WeatherInsurerFactory")
const WeatherInsuranceFactory = require("./WeatherInsuranceFactory")

async function main(){
	let web3 = new Web3(new Web3.providers.WebsocketProvider("ws://localhost:7545"))

	let factory = new WeatherInsurerFactory(web3)

	let accounts = await factory.getAccounts()

	let weatherOracleAddress = WeatherInsurerFactory.loadAddress(__dirname + "/../../WeatherOracle/WeatherOracleAddress.json")
	let smartBankAddress = WeatherInsurerFactory.loadAddress(__dirname + "/../../SmartBank/SmartBankAddress.json")

	let insurerAddress = await factory.deploy(accounts[2], 2500000, "3000000000000", weatherOracleAddress, smartBankAddress)

	web3.currentProvider.connection.close()

	let factory2 = new WeatherInsuranceFactory(null)
}

main()