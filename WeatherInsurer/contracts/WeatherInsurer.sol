pragma solidity ^0.4.21;
pragma experimental ABIEncoderV2;

//import "github.com/Arachnid/solidity-stringutils/strings.sol";

import "../../WeatherOracle/contracts/WeatherOracle.sol";
import "../../SmartBank/contracts/SmartBank.sol";

/*library WeatherInsuranceUtils{
	function getDay() pure public returns (uint){
		return 86400;
	}

	function getDays(uint num) pure public returns (uint){
		return num * getDay();
	}

	function getNumDays(uint startTime, uint endTime) pure public returns (uint){
		require(endTime > startTime);

		return (startTime - endTime) / getDay();
	}
	
	function toString(address x) pure public returns (string){
		bytes memory b = new bytes(20);

		for (uint i = 0; i < 20; i++){
			b[i] = byte(uint8(uint(x) / (2**(8*(19 - i)))));
		}

		return string(b);
	}
}*/

contract WeatherInsurance is WeatherOracleInterface, SmartBankTransferInterface{
	// Data defintions
	enum Status { Ongoing, CheckingClaim, NoClaim, Payingout, Paidout, PayoutFailed }

	struct Policyholder{
		address userAddress;
		string iban;
	}

	struct Policy{
		int64 longitude;
		int64 latitude;

		uint startTime;
		uint endTime;

		// precipitation related parameters
		uint drougthTreshold;
		uint floodTreshold;

		// temperature related parameters
		int temperatureThresold;
		uint numDaysBelowTresholdTemperatureTreshold;

		// payout in case the insurance triggers
		uint payout;
	}

	// Identities
	WeatherInsurer insurer = WeatherInsurer(msg.sender);
	Policyholder policyholder;

	WeatherOracle weatherOracle;
	SmartBank smartBank;

	// The policy
	Policy policy;

	// Status of the claim
	Status status = Status.Ongoing;

	// Access modifiers
	modifier insurerOnly(){
		require(msg.sender == address(insurer), "Sender not authorized.");
		_;
	}

	modifier policyholderOnly(){
		require(msg.sender == policyholder.userAddress, "Sender not authorized.");
		_;
	}

	modifier interestedPartyOnly(){
		require(msg.sender == address(insurer) || msg.sender == policyholder.userAddress, "Sender not authorized.");
		_;
	}

	modifier weatherOracleOnly(){
		require(msg.sender == address(weatherOracle), "Sender not authorized.");
		_;
	}

	modifier bankOnly(){
		require(msg.sender == address(smartBank), "Sender not authorized.");
		_;
	}

	modifier insurancePeriodEnded(){
		require(this.getDurationUntilEndtime() == 0 , "Insurance period has not yet passed.");
		_;
	}

	modifier potentialClaim(){
		require(status == Status.Ongoing || status == Status.PayoutFailed, "You have no claim.");
		_;
	}

	// Functions
	constructor(WeatherOracle _weatherOracle, SmartBank _smartBank) public{
		weatherOracle = _weatherOracle;
		smartBank = _smartBank;
	}

	function setPolicyData(Policyholder _policyholder, Policy _policy) insurerOnly public{
		policyholder = _policyholder;
		policy = _policy;
	}

	/*function getNumDaysBelowTresholdTemperature() public view returns (uint){
		uint day = insurer.getDay();

		uint startTime = policy.startTime;

		if (now > (startTime + day)){
			return 0;
		}

		uint endTime = policy.endTime;

		if (endTime > now){
			endTime = now - day;
		}

		return getNumDaysBelowTresholdTemperatureInternal(startTime, endTime);
	}*/

	function getNumDaysBelowTresholdTemperatureInternal(uint startTime, uint endTime) internal view returns (uint){
		uint numDaysBelowTresholdTemperature = 0;

		uint day = insurer.getDay();

		for (uint i = startTime; i < endTime; i += day){
			int dayTemperature = weatherOracle.computeAverageTemperature(i, i + day);

			if (dayTemperature < policy.temperatureThresold){
				numDaysBelowTresholdTemperature++;
			}
		}

		return numDaysBelowTresholdTemperature;
	}

	function getDurationUntilEndtime() public view returns (uint){
		if (now > policy.endTime){
			return 0;
		}
		else return policy.endTime - now;
	}

	function checkClaim() interestedPartyOnly insurancePeriodEnded potentialClaim public{
		if (status == Status.Ongoing){
			status = Status.CheckingClaim;

			if (getNumDaysBelowTresholdTemperatureInternal(policy.startTime, policy.endTime) > policy.numDaysBelowTresholdTemperatureTreshold){
				payout("Payout due to excessively low temperatures");

				return;
			}

			weatherOracle.requestTotalPrecipitation(policy.longitude, policy.latitude, policy.startTime, policy.endTime, this);
		}
		else if (status == Status.PayoutFailed){
			payout("Payout due to failed previous transfer.");
		}
	}

	function onTotalPrecipitationComputed(uint64 totalPrecipitation) weatherOracleOnly public{
		if (totalPrecipitation < policy.drougthTreshold){
			payout("Payout due to insufficient precipitation.");
		}
		else if (totalPrecipitation > policy.floodTreshold){
			payout("Payout due to excess precipitation.");
		}
		else{
			status = Status.NoClaim;
		}
	}

	function payout(string description) internal{
		status = Status.Payingout;

		insurer.payout(policyholder.iban, policy.payout, description, this);
	}

	function onTransferCompleted() bankOnly public{
		status = Status.Paidout;
	}

	function onTransferFailed() bankOnly public{
		status = Status.PayoutFailed;
	}
}

contract WeatherInsurer is SmartBankClientInterface{
	event InsuranceCreated(WeatherInsurance insurance);
	event Debug(string message);

	struct PolicyInput{
		// Geographical data
		int64 longitude;
		int64 latitude;
		uint64 area;

		// Temporal data
		uint startTime;
		uint endTime;
	}

	struct PolicyOutput{
		// precipitation related parameters
		uint drougthTreshold;
		uint floodTreshold;

		// temperature related parameters
		int temperatureThresold;
		uint numDaysBelowTresholdTemperatureTreshold;

		// payout in case the insurance triggers
		uint payout;
	}

	// The weather insurer owner
	address owner = msg.sender;

	mapping(address => bool) validAddresses;
	
	WeatherOracle weatherOracle;
	SmartBank smartBank;

	modifier notOwner(){
		require(msg.sender != owner, "Sender not authorized.");
		_;
	}

	modifier weatherInsuranceOnly(){
		require(validAddresses[msg.sender], "Sender not authorized.");
		_;
	}

	modifier bankOnly(){
		require(msg.sender == address(smartBank), "Sender not authorized.");
		_;
	}

	modifier bankAuthorizedOnly(){
		require(this.isBankAuthorized(), "The bank has not autorized us yet");
		_;
	}

	constructor(address _weatherOracle, address _smartBank) public{
		weatherOracle = WeatherOracle(_weatherOracle);
		smartBank = SmartBank(_smartBank);
	}

	function isBankAuthorized() view public returns (bool){
		return smartBank.isAuthorized(this);
	}

	function onAuthorized(address client) bankOnly public{
		require(client == address(this));

		// Todo: we can do stuff here after authorization
	}

	function onDeauthorized(address client) bankOnly public{
		require(client == address(this));

		// Todo: we can do stuff here after deauthorization
	}

	// Temp code here
	function getDay() pure public returns (uint){
		return 10;//86400;
	}

	function getDays(uint num) pure public returns (uint){
		return num * getDay();
	}

	function getNumDays(uint startTime, uint endTime) pure public returns (uint){
		require(endTime > startTime);

		return (endTime - startTime) / getDay();
	}
	
	function toString(address x) pure public returns (string){
		bytes memory b = new bytes(20);

		for (uint i = 0; i < 20; i++){
			b[i] = byte(uint8(uint(x) / (2**(8*(19 - i)))));
		}

		return string(b);
	}
	// Temp code end

	function getPolicyOutput(PolicyInput policyInput) public pure returns (PolicyOutput){
		require(policyInput.area > 0);

		uint numDays = getNumDays(policyInput.startTime, policyInput.endTime);
		require(numDays >= 3 && numDays <= 365);

		PolicyOutput memory policyOutput;
		policyOutput.drougthTreshold = numDays * 1;	// 1 mm of precipitation per day is the treshold for drought
		policyOutput.floodTreshold = numDays * 3;	// 3 mm of precipitation per day is the treshold for flood

		policyOutput.temperatureThresold = 5;	// Temperatures below 5 degrees celcius are 
		policyOutput.numDaysBelowTresholdTemperatureTreshold = numDays / 10;

		policyOutput.payout = numDays * 300;

		return policyOutput;
	}

	function getPolicyHolder(address userAddress, string iban) internal pure returns (WeatherInsurance.Policyholder){
		WeatherInsurance.Policyholder memory policyholder;
		policyholder.userAddress = userAddress;
		policyholder.iban = iban;

		return policyholder;
	}

	function getPolicy(PolicyInput policyInput) internal view returns (WeatherInsurance.Policy){
		// Generate all data
		PolicyOutput memory policyOutput = this.getPolicyOutput(policyInput);

		// Combine the input and output to a data structure we need for the insurance
		WeatherInsurance.Policy memory policy;
		policy.longitude = policyInput.longitude;
		policy.latitude = policyInput.latitude;
		policy.startTime = policyInput.startTime;
		policy.endTime = policyInput.endTime;

		policy.drougthTreshold = policyOutput.drougthTreshold;
		policy.floodTreshold = policyOutput.floodTreshold;
		policy.temperatureThresold = policyOutput.temperatureThresold;
		policy.numDaysBelowTresholdTemperatureTreshold = policyOutput.numDaysBelowTresholdTemperatureTreshold;

		policy.payout = policyOutput.payout;

		return policy;
	}

	function createInsurance(PolicyInput policyInput, string iban) bankAuthorizedOnly notOwner public{
		require(policyInput.startTime > now);

		// Generate all data we need for the insurance contract
		WeatherInsurance.Policyholder memory policyholder = getPolicyHolder(msg.sender, iban);
		WeatherInsurance.Policy memory policy = getPolicy(policyInput);

		// Create the insurance contract
		WeatherInsurance insurance = new WeatherInsurance(weatherOracle, smartBank);
		insurance.setPolicyData(policyholder, policy);	// Workaround. Passing in constructor does not work

		// Register our insurance contract
		validAddresses[address(insurance)] = true;

		// Return the contract, so that the user can interact with it.
		emit InsuranceCreated(insurance);
	}

	function payout(string iban, uint amount, string description, WeatherInsurance delegate) weatherInsuranceOnly public{
		smartBank.requestTransfer(iban, amount, description, delegate);
	}
}