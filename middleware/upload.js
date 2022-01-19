const multer = require('multer')
const moment = require('moment')

const storage = multer.diskStorage({
    destination(req, file, cb) {
        console.log("multer")
        cb(null, './uploads/')
    },
    filename(req, file, cb) {
        const date = moment().format('DDMMYYYY-HHmmss_SSS')
        cb(null, `${date}-${file.originalname}`)
    }
})

module.exports = multer({
    storage
})