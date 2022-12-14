const Axios = require("axios")
const fs = require("fs")

async function getImageToCurrentFolder() {
    const url = await createRandomPokemonUrl()
    const response = await Axios({
        method: "GET",
        url: url,
        responseType: "stream",
    })
    const path = "../pokemonImages/pokemonImage"
    response.data.pipe(fs.createWriteStream(path))

    return new Promise((resolve, reject) => {
        response.data.on("end", () => {
            resolve()
        })

        response.data.on("error", (error) => {
            reject(error)
        })
    })
}

async function createRandomPokemonUrl() {
    urlBegin = "https://images.alexonsager.net/pokemon/fused/"
    const x = parseInt((Math.random() * 1000) % 151)
    const y = parseInt((Math.random() * 1000) % 151)
    const urlFinal = urlBegin + x + "/" + x + "." + y + ".png"
    return urlFinal
}

async function callIt() {
    const result = await getImageToCurrentFolder()
    console.log(result)
}

callIt()
