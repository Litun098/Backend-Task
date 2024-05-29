const express = require("express");

const { createItem } = require("../controllers/itemController");

const { verifyJWT } = require("../middlewares/authMiddleware");
const { upload } = require("../middlewares/multer");
const { isAdmin } = require("../middlewares/roleMiddleware");

const router = express.Router();

router.post("/", verifyJWT,isAdmin, upload.single("image"), createItem);

module.exports = router;
