const path = require("path")
const fs = require("fs")
async function index() {
    let imagesDir = path.join(__dirname, "public", "images");
    let files = fs.readdirSync(imagesDir);
    let imagePaths = files.map(f => {
        return {[f]: `https://api.baristica.az/md/${f}`}
    });
    console.log(imagePaths[10])
}
index()