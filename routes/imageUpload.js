const router = require("express").Router();

const uploadOnCloudinary = require("../utils/cloudinery");
const path = require("path");

const multer = require("multer");

// Set storage engine
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    return cb(null, "./public"); // Destination directory for uploaded files
  },
  filename: function (req, file, cb) {
    return cb(null, Date.now() + path.extname(file.originalname)); // File naming
  },
});

const upload = multer({ storage: storage });

router.post("/",upload.single("images"), async (req, res) => {
    const image = await uploadOnCloudinary(req.file.path)
    res.status(200).json({url : image.secure_url})
});

module.exports = router;
