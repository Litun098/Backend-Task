const db = require("../dbConfig/db");

// Retrieve notifications for the logged-in user
exports.getNotifications = async (req, res) => {
  const userId = req.user.id;

  try {
    const [notifications] = await db.query(
      "SELECT * FROM notifications WHERE user_id = ?",
      [userId]
    );
    res.status(200).json({ notifications });
  } catch (error) {
    console.error("Error fetching notifications:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Mark notifications as read
exports.markNotificationsRead = async (req, res) => {
  const userId = req.user.id;

  try {
    await db.query(
      "UPDATE notifications SET is_read = TRUE WHERE user_id = ?",
      [userId]
    );
    res.status(200).json({ message: "Notifications marked as read" });
  } catch (error) {
    console.error("Error marking notifications as read:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

