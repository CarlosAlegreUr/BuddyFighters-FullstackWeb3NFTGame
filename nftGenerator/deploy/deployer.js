const { deployMocks } = require("./00-deployMocks")
const { deployBuddyFightersNFT } = require("./01-deployBuddyFighterNFT")
const { deployFight } = require("./02-deployFight")


module.exports = {
    deployer: {
        deployMocks: deployMocks,
        deployBuddyFightersNFT: deployBuddyFightersNFT,
        deployFight: deployFight,
    }
}
