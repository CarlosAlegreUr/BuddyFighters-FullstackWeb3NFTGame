const Axios = require("axios")
const fs = require("fs")
const { resolve } = require("path")

async function createImageInPokemonImagesFolder(num1, num2) {
    const { url } = await createPokemonUrl(num1, num2)
    const response = await Axios({
        method: "GET",
        url: url,
        responseType: "stream",
    })
    const path = resolve(__dirname, "pokemonImages", "pokemonImage")
    await response.data.pipe(fs.createWriteStream(path))

    const imageObject = await fs.readFileSync(path)
    return imageObject
}

function createPokemonUrl(num1, num2) {
    urlBegin = "https://images.alexonsager.net/pokemon/fused/"
    
    const urlFinal = urlBegin + num1 + "/" + num1 + "." + num2 + ".png"
    return { url: urlFinal }
}

module.exports = async (num1, num2) => {
    const imageObject = await createImageInPokemonImagesFolder(num1, num2)
    console.log("Image downloaded!")
    return imageObject
}

// async function test(num1, num2) {
//     await createImageInPokemonImagesFolder(num1, num2)
// }

// test(1, 150)
