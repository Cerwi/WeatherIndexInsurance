const Web3 = require("web3")
const SmartBank = require("../src/SmartBank")

async function main(){
	let web3 = new Web3(new Web3.providers.WebsocketProvider("ws://localhost:7545"))
	let accounts = await web3.eth.getAccounts()

	let abi = SmartBank.loadAbi(__dirname + "/../SmartBankAbi.json")
	let address = SmartBank.loadAddress(__dirname + "/../SmartBankAddress.json")

	console.log(`Running SmartBank dapp with backend ${address}`)

	let bank = new SmartBank(web3, accounts[0], abi, address)

	for (let i = 3; i < accounts.length; i++){
		let account = bank.createAccount()
		account.balance = 100

		//await bank.authorize(accounts[i], account.iban, "0")
	}
}

main()