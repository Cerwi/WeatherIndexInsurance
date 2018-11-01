const assert = require("assert")

const Utils = require("../../Base/src/Utils")

const Dapp = require("../../Base/src/Dapp")	// temp
const SimpleDapp = require("../../Base/src/SimpleDapp")

// Todo: move these

module.exports = class WeatherOracle extends SimpleDapp{
	constructor(web3, account, abi, address){
		super(web3, account, abi, address)

		let self = this

		this.contract.events.OnTotalPrecipitationRequested({}, async function(error, data){
			let longitude = data.returnValues[0]
			let latitude = data.returnValues[1]
			let startTime = data.returnValues[2]
			let endTime = data.returnValues[3]
			let delegate = data.returnValues[4]

			await self.processTotalPrecipitation(longitude, latitude, startTime, endTime, delegate)
		})
	}

	async processTotalPrecipitation(longitude, latidude, startTime, endTime, delegate){
		assert(endTime > startTime)

		let duration = endTime - startTime
		let numDays = duration / 10
		let totalPrecipitation = Math.floor(numDays * Math.random() * 5)

		console.log(`Total precipitation of ${totalPrecipitation} on (${longitude} x ${latidude}) during ${startTime} and ${endTime}`)

		await this.totalPrecipitationComputed(totalPrecipitation, delegate)
	}

	async storeTemperature(time, temperature){
		await this.contract.methods.storeTemperature(time, temperature).send({from: this.account})
	}

	async computeAverageTemperature(startTime, endTime){
		return await this.contract.methods.computeAverageTemperature(startTime, endTime).call()
	}

	async requestTotalPrecipitation(longitude, latitude, startTime, endTime){
		await this.contract.methods.requestTotalPrecipitation(longitude, latitude, startTime, endTime).send({from: this.account})
	}

	async totalPrecipitationComputed(totalPrecipitation, delegate){
		await this.contract.methods.totalPrecipitationComputed(totalPrecipitation, delegate).send({from: this.account})
	}

	async run(){
		while (true){
			let time = Utils.generateTimestamp()
			let temp = Utils.RandomInt(-17, 40)

			//console.log(`Storing temperature = ${temp}`)

			this.storeTemperature(time, temp)

			await Utils.sleep(1000)
		}
	}
}
/*
let account = "0x0498c2a9aBb381e800e58806ac10538Da474Cb44"//process.argv[2]
let abi// = Dapp.loadAbi(process.argv[3])
let address// = process.argv[4]

let account2 = "0x3CA65a648eeb139933FAE963Cbf30A3D500F88B3"
let account3 = "0x8D15cC1328633eD36f260aF5a0B61c449EA7f7a7"

async function main(){
	// Temp code
	console.log("Compiling and deploying")

	const ContractCompiler = require("../../Base/src/ContractCompiler")

	let compiler = new ContractCompiler()
	compiler.compile(__dirname + "/../contracts/WeatherOracle.sol")

	let tempDapp = new Dapp()

	let contractData = await compiler.deployContract(tempDapp.web3, "fileName:WeatherOracle", account, 1500000, "3000000000000")
	// End temp code

	console.log("Creating WeatherOracle")
	let weatherOracle = new WeatherOracle(account, contractData.options.jsonInterface, contractData.options.address)

	console.log("Running WeatherOracle")
	weatherOracle.run()

	console.log("Done")

	while (true){
		await sleep(5000)

		let time = generateTimestamp()

		let temp = await weatherOracle.computeAverageTemperature(time - 5, time)

		console.log(`Average temperature = ${temp}`)
	}
}

main()*/