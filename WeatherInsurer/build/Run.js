const Web3 = require("web3")
const WeatherInsurer = require("../src/WeatherInsurer")

async function main(){
	let web3 = new Web3(new Web3.providers.WebsocketProvider("ws://localhost:7545"))
	let accounts = await web3.eth.getAccounts()

	let abi = WeatherInsurer.loadAbi(__dirname + "/..WeatherInsurerAbi.json")
	let address = WeatherInsurer.loadAddress(__dirname + "/../WeatherInsurerAddress.json")

	console.log(`Running WeatherInsurer dapp with backend ${address}`)
}

main()