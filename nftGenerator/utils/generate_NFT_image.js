// Doesn't work, problems with permission and paths.

const imageDownloader = require("image-downloader")
 
function getImageToCurrentFolder() {
    urlBegin = "https://images.alexonsager.net/pokemon/fused/" 
    const x = parseInt((Math.random() * 1000)%151)
    const y = parseInt((Math.random() * 1000)%151)
    urlFinal = urlBegin + x + "/" + x + "." + y + ".png"
    const options = {
        url: urlFinal,
        dest: './utils/image.png'
    }
    imageDownloader.image(options)
}
 
getImageToCurrentFolder()
