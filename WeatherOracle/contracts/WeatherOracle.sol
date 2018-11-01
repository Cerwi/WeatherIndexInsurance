pragma solidity ^0.4.21;
pragma experimental ABIEncoderV2;

// Interface that can be implemented to receive delegates when the total precipitation is computed.
interface WeatherOracleInterface{
	function onTotalPrecipitationComputed(uint64 totalPrecipitation) external;
}

contract WeatherOracle{
	// Event to which the WeatherOracle dapp will respon when the total precipitation is computed.
	event OnTotalPrecipitationRequested(int64 longitude, int64 latitude, uint startTime, uint endTime, WeatherOracleInterface delegate);

	// The weather oracle owner
	address owner = msg.sender;

	// We store a list of temperatures that are produced by the WeatherOracle dapp. Todo: this is not very efficient.
	struct Temperature{
		int8 value;
		bool isSet;
	}
	mapping(uint => Temperature) temperatures;

	// Modifier: allow only the WeatherOracle owner to execute.
	modifier ownerOnly(){
		require(msg.sender == owner, "Sender not authorized.");
		_;
	}

	// The weather dapp has produced a new temperature, so we store it in our mapping.
	function storeTemperature(uint time, int8 temperature) ownerOnly external{
		Temperature memory data;
		data.value = temperature;
		data.isSet = true;

		temperatures[time] = data;
	}

	// Computes the average temperature over a timespan.
	function computeAverageTemperature(uint startTime, uint endTime) external view returns(int64){
		require(endTime > startTime);

		int64 total = 0;
		int64 count = 0;

		for (uint i = startTime; i < endTime; i++){
			if (!temperatures[i].isSet){
				continue;	// Todo: this is not very efficient.
			}

			total += temperatures[i].value;
			count++;
		}

		if (count == 0){
			return -10000;
		}
		
		//require(count != 0);

		return total / count;
	}

	// Request the total precipitation at the specified geographical coordinates during a timespan
	function requestTotalPrecipitation(int64 longitude, int64 latitude, uint startTime, uint endTime, WeatherOracleInterface delegate) external{
		require(endTime > startTime);
		require(delegate != WeatherOracleInterface(0));

		emit OnTotalPrecipitationRequested(longitude, latitude, startTime, endTime, delegate);
	}

	// Notification that a precipitation request has been computed.
	function totalPrecipitationComputed(uint64 totalPrecipitation, WeatherOracleInterface delegate) ownerOnly external{
		delegate.onTotalPrecipitationComputed(totalPrecipitation);
	}
}