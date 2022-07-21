
async function deployMocks() {

}

deployMocks().then(function () {
    process.exitCode = 0
}).catch((error) => {
    console.log(error)
    process.exitCode = 1
})

module.exports = {
    deployMocks: deployMocks,
}
