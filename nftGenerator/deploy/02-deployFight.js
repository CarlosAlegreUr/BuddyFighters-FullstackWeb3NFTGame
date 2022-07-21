
async function deployFight() {

}

deployFight().then(function () {
    process.exitCode = 0
}).catch((error) => {
    console.log(error)
    process.exitCode = 1
})

module.exports = {
    deployFight: deployFight,
}
