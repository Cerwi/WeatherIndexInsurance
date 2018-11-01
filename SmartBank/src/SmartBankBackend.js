const assert = require("assert")

const SmartBankAccount = require("./SmartBankAccount")

module.exports = class SmartBankBackend{
	constructor(){
		this.accounts = {}
	}

	generateIban(){
		function s4(){
			return Math.floor((1 + Math.random()) * 0x10000).toString(16).substring(1)
		}

		return s4() + s4() + '-' + s4() + '-' + s4() + '-' + s4() + '-' + s4() + s4() + s4()
	}

	createAccount(){
		let account = new SmartBankAccount(this.generateIban())
		
		this.accounts[account.iban] = account

		return account
	}

	findAccount(iban){
		assert(iban)

		return this.accounts[iban]
	}
}