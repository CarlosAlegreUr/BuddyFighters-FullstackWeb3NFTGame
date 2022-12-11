const { task } = require("hardhat/config")

task("accounts", "Prints the list of accounts", async (taskArgs, hre) => {
	const accounts = await hre.ethers.getSigners()

	for (const account of accounts) {
		console.log(account.address)
	}
})
// .setAction()

task("deploy", "Deploys all contracts in contracts folder", async (tskArgs, hre) => {
	// Use run() hardhat function to run all scripts on deploy directory. Excluding the 00 script
})
