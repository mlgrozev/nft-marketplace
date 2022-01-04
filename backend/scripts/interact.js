const hre = require('hardhat')
const USElection = require('../artifacts/contracts/USElection.sol/USElection.json')

const run = async function() {
	const provider = new hre.ethers.providers.JsonRpcProvider("http://localhost:8545")
	const latestBlock = await provider.getBlock("latest")
	console.log(latestBlock.hash)
    const wallet = new hre.ethers.Wallet("0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80", provider);
	const balance = await wallet.getBalance();
    const contractAddress = "0x5FbDB2315678afecb367f032d93F642f64180aa3"
	const electionContract = new hre.ethers.Contract(contractAddress, USElection.abi, wallet)
    const transactionOhio = await electionContract.submitStateResult(["Ohio", 250, 150, 24]);
	const transactionReceipt = await transactionOhio.wait();
	if (transactionReceipt.status != 1) { // 1 means success
		console.log("Transaction was not successful")
		return 
	}

	const resultsSubmittedOhioNew = await electionContract.resultsSubmitted("Ohio")
	console.log("Results submitted for Ohio", resultsSubmittedOhioNew)

	const currentLeader = await electionContract.currentLeader()
	console.log("Current leader", currentLeader)
}

run()