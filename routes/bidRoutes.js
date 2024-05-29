const express = require("express");
const {
  getAllBidsForItem,
  placeBidOnItem,
} = require("../controllers/bidController");
const { verifyJWT } = require("../middlewares/authMiddleware");
const { isAdmin } = require("../middlewares/roleMiddleware");
const router = express.Router();

// POST /items/:itemId/bids
router.post("/:itemId/bids", verifyJWT, isAdmin, placeBidOnItem);
// GET /items/:itemId/bids
router.get("/:itemId/bids", getAllBidsForItem);

module.exports = router;
