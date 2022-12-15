const Axios = require("axios")
const fs = require("fs")
const { resolve } = require("path")

async function createImageInPokemonImagesFolder() {
    const { url, num1, num2 } = await createRandomPokemonUrl()
    const response = await Axios({
        method: "GET",
        url: url,
        responseType: "stream",
    })
    const path = resolve(__dirname, "pokemonImages", "pokemonImage")
    await response.data.pipe(fs.createWriteStream(path))

    return { num1: num1, num2: num2 }
}

async function createRandomPokemonUrl() {
    urlBegin = "https://images.alexonsager.net/pokemon/fused/"
    const x = parseInt((Math.random() * 1000) % 151)
    const y = parseInt((Math.random() * 1000) % 151)
    const urlFinal = urlBegin + x + "/" + x + "." + y + ".png"
    return { url: urlFinal, num1: x, num2: y }
}

module.exports = async () => {
    const { num1, num2 } = await createImageInPokemonImagesFolder()
    return [num1, num2]
}
