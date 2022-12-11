// Doesn't work, problems with permission and paths.

const imageDownloader = require("image-downloader")
const fetch = require("node-fetch")
 
async function getImageToCurrentFolder() {
    urlBegin = "https://images.alexonsager.net/pokemon/fused/" 
    const x = parseInt((Math.random() * 1000)%151)
    const y = parseInt((Math.random() * 1000)%151)
    const urlFinal = urlBegin + x + "/" + x + "." + y + ".png"
    const options = {
        url: urlFinal,
        dest: './utils/image.png'
    }
    const image = await fetch(urlFinal)
    imageDownloader.image(options)
}
 
getImageToCurrentFolder()
