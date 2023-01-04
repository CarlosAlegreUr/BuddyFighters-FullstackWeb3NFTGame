const { run } = require("hardhat")

async function verify(contractAddress, args) {
    console.log("Verifying contract ", `${contractAddress} `, "...")
    try {
        await run("verify:verify", {
            address: contractAddress,
            constructorArguments: args,
        })
        console.log(`Contract at ${contractAddress} got verified!`)
    } catch (error) {
        if (error.message.toLowerCase().includes("already verifyed")) {
            console.log("Already verified.")
        } else {
            console.log(error)
        }
    }
}

module.exports = {
    verify: verify,
}
