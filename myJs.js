const fs = require("fs")


let fileRead = fs.readFileSync("TEST_PHOTO.png")
console.log("READBUF: ", Uint8Array.from(fileRead))
let b64Ver = "data:type=image/*;base64,"+fileRead.toString('base64')

let extractedb64 = getImgBuffFromBase64(b64Ver)
fs.writeFileSync("WRITE_TEST_fileread.png", fileRead)
fs.writeFileSync("WRITE_TEST_ext.png", extractedb64)

function getImgBuffFromBase64(img) {
    let imgBuffString = Buffer.from(img.split("data:type=image/*;base64,")[1], 'base64')
    console.log("IMG BUF: ", Uint8Array.from(imgBuffString))
    return Buffer.from(imgBuffString)
};