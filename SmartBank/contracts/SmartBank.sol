pragma solidity ^0.4.21;
pragma experimental ABIEncoderV2;

// Interface that can be implemented to receive delegates when a client is authorized or deauthorized.
interface SmartBankClientInterface{
	function onAuthorized(address client) external;
	function onDeauthorized(address client) external;
}

// Inerface that can be implemented to receive delegates when transfers complete or fail.
interface SmartBankTransferInterface{
	function onTransferCompleted() external;
	function onTransferFailed() external;
}

contract SmartBank{
	// Event to which the SmartBank dapp will respond when a transfer is requested.
	event OnTransferRequested(address clientAddress, string iban, uint amount, string description, SmartBankTransferInterface delegate);

	// The bank owner.
	address owner = msg.sender;

	// We store a list of all addresses that are authorized to make transactions.
	mapping(address => SmartBankClientInterface) clients;

	// Modifier: allow only the SmartBank owner to execute.
	modifier ownerOnly(){
		require(msg.sender == owner, "Sender not authorized.");
		_;
	}

	// Modifier: allow only a client to execute.
	modifier clientOnly(){
		require(clients[msg.sender] != SmartBankClientInterface(0), "Sender not authorized.");
		_;
	}

	// Authorize a new client to make transfers through this contract. The address-iban mapping takes place in the dApp.
	function authorize(address client, SmartBankClientInterface delegate) ownerOnly external{
		//require(clients[client] == SmartBankClientInterface(0));
		require(delegate != SmartBankClientInterface(0));

		clients[client] = delegate;

		delegate.onAuthorized(client);
	}

	// Deauthorize a client to make any further transfers. Any pending transfers will still be carried out.
	function deauthorize() clientOnly external{
		clients[msg.sender].onDeauthorized(msg.sender);
		clients[msg.sender] = SmartBankClientInterface(0);
	}

	// Check if a client is authorized to make transfers.
	function isAuthorized(address client) view external returns(bool){
		return clients[client] != SmartBankClientInterface(0);
	}

	// Request a transfer of funds.
	function requestTransfer(string iban, uint amount, string description, SmartBankTransferInterface delegate) clientOnly external{
		require(delegate != SmartBankTransferInterface(0));
		
		emit OnTransferRequested(msg.sender, iban, amount, description, delegate);
	}

	// Notification that a transfer has completed or failed.
	function transferCompleted(bool success, SmartBankTransferInterface delegate) ownerOnly external{
		if (success){
			delegate.onTransferCompleted();
		}
		else{
			delegate.onTransferFailed();
		}
	}
}

contract SmartBankTest is SmartBankTransferInterface{
	event OnSmartBankTest(string log);

	address public owner = msg.sender;

	SmartBank usedSmartBank;

	modifier ownerOnly(){
		require(msg.sender == owner, "Sender not authorized.");
		_;
	}

	modifier bankOnly(){
		require(msg.sender == address(usedSmartBank), "Sender not authorized.");
		_;
	}

	function test(SmartBank smartBank) ownerOnly external{
		emit OnSmartBankTest("Requesting");

		usedSmartBank = smartBank;

		smartBank.requestTransfer("abc", 100, "Payment for SmartBankTest", this);

		emit OnSmartBankTest("Requested");
	}

	function onTransferCompleted() bankOnly external{
		emit OnSmartBankTest("Completed");
	}

	function onTransferFailed() bankOnly external{
		emit OnSmartBankTest("Failed");
	}
}