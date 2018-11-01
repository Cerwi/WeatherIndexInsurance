const assert = require("assert")

module.exports = class SmartBankAccount{
	constructor(iban){
		this.iban = iban
		this.balance = 0
	}
}