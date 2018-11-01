const Web3 = require("web3")

const WeatherOracleFactory = require("./WeatherOracleFactory")

async function main(){
	let web3 = new Web3(new Web3.providers.WebsocketProvider("ws://localhost:7545"))
	
	let factory = new WeatherOracleFactory(web3)

	let accounts = await factory.getAccounts()

	await factory.deploy(accounts[1], 1500000, "3000000000000")

	web3.currentProvider.connection.close()
}

main()