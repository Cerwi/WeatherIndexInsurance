const Web3 = require("web3")

const SmartBankFactory = require("./SmartBankFactory")

async function main(){
	let web3 = new Web3(new Web3.providers.WebsocketProvider("ws://localhost:7545"))

	let factory = new SmartBankFactory(web3)

	let accounts = await factory.getAccounts()

	await factory.deploy(accounts[0], 1500000, "3000000000000")

	web3.currentProvider.connection.close()
}

main()