/*require("../../SmartBank/build/Deploy")
require("../../WeatherOracle/build/Deploy")
require("../../WeatherInsurer/build/Deploy")*/



console.log("Done with that")

const Web3 = require("web3")

const Utils = require("../../Base/src/Utils")

// Assumption is: we have 

// Load 3 dapps
const SmartBank = require("../../SmartBank/src/SmartBank")
const WeatherOracle = require("../../WeatherOracle/src/WeatherOracle")
const WeatherInsurer = require("../src/WeatherInsurer")
//const WeatherInsurance = require("../src/WeatherInsurance")

async function smartBankMain(){
	let web3 = new Web3(new Web3.providers.WebsocketProvider("ws://localhost:7545"))
	let accounts = await web3.eth.getAccounts()

	let abi = SmartBank.loadAbi(__dirname + "/../../SmartBank/SmartBankAbi.json")
	let address = SmartBank.loadAddress(__dirname + "/../../SmartBank/SmartBankAddress.json")

	console.log(`Running SmartBank dapp with backend ${address}`)

	let bank = new SmartBank(web3, accounts[0], abi, address)

	// Create bank account for weather insurer
	let insurerAccount = bank.createAccount()
	insurerAccount.balance = 10000000

	// Authorize the weather insurer contract to make payments through the bank
	let insurerAddress = WeatherInsurer.loadAddress(__dirname + "/../WeatherInsurerAddress.json")
	await bank.authorize(insurerAddress, insurerAccount.iban, insurerAddress)

	return bank
}

async function weatherOracleMain(){
	let web3 = new Web3(new Web3.providers.WebsocketProvider("ws://localhost:7545"))
	let accounts = await web3.eth.getAccounts()

	let abi = WeatherOracle.loadAbi(__dirname + "/../../WeatherOracle/WeatherOracleAbi.json")
	let address = WeatherOracle.loadAddress(__dirname + "/../../WeatherOracle/WeatherOracleAddress.json")

	console.log(`Running WeatherOracle dapp with backend ${address}`)

	let oracle = new WeatherOracle(web3, accounts[1], abi, address)

	oracle.run()

	return oracle
}

async function testContract(bank, insurer, i){
	// Create bank accounts
	let account = bank.createAccount()
	account.balance = 100

	let policyInput = {}
	policyInput.longitude = Utils.RandomInt(-64, 64)
	policyInput.latitude = Utils.RandomInt(-64, 64)
	policyInput.area = Utils.RandomInt(32, 64)

	policyInput.startTime = Utils.generateTimestamp() + 5
	policyInput.endTime = policyInput.startTime + (Utils.RandomInt(90, 360) * 10)

	let duration = policyInput.endTime - policyInput.startTime

	let insurance = await insurer.createInsurance(policyInput, account.iban)
	console.log(`Insurance created on address ${insurance.address} for ${duration / 10} days`)

	while (true){
		let duration = await insurance.getDurationUntilEndtime()

		let numDaysBelowTresholTemperature = 0//await insurance.getNumDaysBelowTresholdTemperature()

		//console.log(`Duration until end = ${duration / 10}. Num days below treshold temperature = ${numDaysBelowTresholTemperature}`)

		if (duration == 0){
			break
		}

		await Utils.sleep(1000)
	}

	console.log(`Checking claim for contract ${i}.`)

	await insurance.checkClaim()
}

async function main(){
	let bank = await smartBankMain()
	let oracle = await weatherOracleMain()

	let web3 = new Web3(new Web3.providers.WebsocketProvider("ws://localhost:7545"))
	let accounts = await web3.eth.getAccounts()

	let insurerAbi = WeatherInsurer.loadAbi(__dirname + "/../WeatherInsurerAbi.json")
	let insurerAddress = WeatherInsurer.loadAddress(__dirname + "/../WeatherInsurerAddress.json")

	for (let i = 3; i < accounts.length; i++){
		// Create insurer instance
		let insurer = new WeatherInsurer(web3, accounts[i], insurerAbi, insurerAddress)

		for (let j = 0; j < 5; j++){
			testContract(bank, insurer, i)
		}
	}
}

main()