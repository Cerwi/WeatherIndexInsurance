const Web3 = require("web3")
const WeatherOracle = require("../src/WeatherOracle")

async function main(){
	let web3 = new Web3(new Web3.providers.WebsocketProvider("ws://localhost:7545"))
	let accounts = await web3.eth.getAccounts()

	let abi = WeatherOracle.loadAbi(__dirname + "/../WeatherOracleAbi.json")
	let address = WeatherOracle.loadAddress(__dirname + "/../WeatherOracleAddress.json")

	console.log(`Running WeatherOracle dapp with backend ${address}`)

	let oracle = new WeatherOracle(web3, accounts[1], abi, address)

	await oracle.run()
}

main()