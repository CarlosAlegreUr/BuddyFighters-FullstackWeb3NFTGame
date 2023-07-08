const { network, run } = require("hardhat");

describe("Deployement.", function () {
    it("All contracts deployed.", async function () {
        if (network.name == "hardhat") {
            await run("deploy");
        }
    });
});
