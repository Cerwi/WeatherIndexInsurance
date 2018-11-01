const assert = require("assert")

module.exports = class Contract{
	constructor(contract){
		assert(contract)

		this.contract = contract
	}

	get options(){
		assert(this.contract)

		return this.contract.options
	}

	get methods(){
		assert(this.contract)

		return this.contract.methods
	}

	get events(){
		assert(this.contract)

		return this.contract.events
	}

	/*get once(){
		assert(this.contract)

		return this.contract.once
	}*/
}