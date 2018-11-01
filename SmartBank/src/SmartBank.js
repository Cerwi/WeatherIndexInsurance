const assert = require("assert")

const SmartBankBackend = require("./SmartBankBackend")

const SimpleDapp = require("../../Base/src/SimpleDapp")

module.exports = class SmartBank extends SimpleDapp{
	constructor(web3, account, abi, address){
		super(web3, account, abi, address)

		this.backend = new SmartBankBackend()
		this.authorizedAddresses = {}

		let self = this

		this.contract.events.OnTransferRequested({}, async function(error, data){
			let clientAddress = data.returnValues[0]
			assert(clientAddress)

			let clientIban = self.authorizedAddresses[clientAddress]
			assert(clientIban)

			let iban = data.returnValues[1]
			let amount = data.returnValues[2]
			let description = data.returnValues[3]
			let delegate = data.returnValues[4]

			await self.processTransfer(clientIban, iban, amount, description, delegate)
		})
	}

	createAccount(){
		return this.backend.createAccount()
	}

	async authorize(address, iban, delegate){
		assert(address)
		assert(this.backend.findAccount(iban))
		assert(delegate)

		await this.contract.methods.authorize(address, delegate).send({from: this.account})

		this.authorizedAddresses[address] = iban
	}

	async transferCompleted(success, delegate){
		await this.contract.methods.transferCompleted(success, delegate).send({from: this.account})
	}

	async processTransfer(clientIban, targetIban, amount, description, delegate){
		assert(clientIban)
		assert(targetIban)
		assert(amount)
		assert(description)
		assert(delegate)

		//console.log(this)
		//console.log(this.backend)

		console.log(`Transferring ${amount} from ${clientIban} to ${targetIban}. Description: ${description} Delegate: ${delegate}`)

		let clientAccount = this.backend.findAccount(clientIban)

		if (clientAccount.balance >= amount){
			clientAccount.balance -= amount

			let targetAccount = this.backend.findAccount(targetIban)

			if (targetAccount){
				targetAccount.balance += amount;
			}

			await this.transferCompleted(true, delegate)
		}
		else{
			//console.log(`Insufficient balance ${clientAccount.balance}`)
			await this.transferCompleted(false, delegate)
		}
	}
}