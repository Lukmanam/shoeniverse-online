const multer = require("multer");
const path = require("path");

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        return cb(null, "./public/adminAsset/IMAGES");
    },
    filename: function (req, file, cb) {
        cb(null, `${Date.now()}SHOENIVERSE-${file.originalname}`);
    },
});

const upload = multer({ storage: storage });
module.exports = upload;
