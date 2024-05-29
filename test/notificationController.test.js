const db = require("../dbConfig/db");
const {
  getNotifications,
  markNotificationsRead,
} = require("../controllers/notificationController");

// Mock dependencies
jest.mock("../dbConfig/db", () => ({
  query: jest.fn(),
}));

describe("Notification Controller", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("getNotifications", () => {
    it("should retrieve notifications for the logged-in user", async () => {
      const req = { user: { id: 1 } };
      const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };

      const mockNotifications = [{ id: 1, message: "Test notification" }];
      db.query.mockResolvedValueOnce([mockNotifications]);

      await getNotifications(req, res);

      expect(db.query).toHaveBeenCalledWith(
        "SELECT * FROM notifications WHERE user_id = ?",
        [1]
      );
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ notifications: mockNotifications });
    });

    it("should handle errors during notification retrieval", async () => {
      const req = { user: { id: 1 } };
      const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };

      db.query.mockRejectedValueOnce(new Error("Database error"));

      await getNotifications(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: "Internal server error" });
    });
  });

  describe("markNotificationsRead", () => {
    it("should mark notifications as read for the logged-in user", async () => {
      const req = { user: { id: 1 } };
      const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };

      db.query.mockResolvedValueOnce();

      await markNotificationsRead(req, res);

      expect(db.query).toHaveBeenCalledWith(
        "UPDATE notifications SET is_read = TRUE WHERE user_id = ?",
        [1]
      );
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ message: "Notifications marked as read" });
    });

    it("should handle errors during marking notifications as read", async () => {
      const req = { user: { id: 1 } };
      const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };

      db.query.mockRejectedValueOnce(new Error("Database error"));

      await markNotificationsRead(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: "Internal server error" });
    });
  });
});
