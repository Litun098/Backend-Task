const express = require("express");
const { verifyJWT } = require("../middlewares/authMiddleware");
const {
  getNotifications,
  markNotificationsRead,
} = require("../controllers/notificationController");

const router = express.Router();

// GET /notifications - Retrieve notifications for the logged-in user
router.get("/", verifyJWT, getNotifications);

// POST /notifications/mark-read - Mark notifications as read
router.post("/mark-read", verifyJWT, markNotificationsRead);

module.exports = router;
