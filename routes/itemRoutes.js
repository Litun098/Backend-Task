const express = require("express");

const {
  createItem,
  getAllItems,
  getItemById,
  deleteItem,
  updateItem,
} = require("../controllers/itemController");

const { verifyJWT } = require("../middlewares/authMiddleware");
const { upload } = require("../middlewares/multer");
const { isAdmin } = require("../middlewares/roleMiddleware");

const router = express.Router();

router.post("/", verifyJWT, isAdmin, upload.single("image"), createItem);

router.get("/", getAllItems);

router.get("/:id", getItemById);

router.put("/:id", verifyJWT, updateItem);

router.delete("/:id", verifyJWT, isAdmin, deleteItem);

module.exports = router;
