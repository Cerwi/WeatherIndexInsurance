const assert = require("assert")

module.exports = class Utils{
	static generateTimestamp(){
		return Math.floor(new Date().getTime() / 1000)
	}

	static RandomInt(min, max){
		return Math.floor(Math.random() * (max - min + 1)) + min
	}

	static sleep(ms) {
		return new Promise(resolve => setTimeout(resolve, ms))
	}
}