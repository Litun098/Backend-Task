const db = require("../dbConfig/db");
const {
  placeBidOnItem,
  getAllBidsForItem,
} = require("../controllers/bidController");

// Mock dependencies
jest.mock("../dbConfig/db", () => ({
  query: jest.fn(),
}));

describe("Bid Controller", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("placeBidOnItem", () => {
    it("should place a bid on an item", async () => {
      const req = {
        params: { itemId: 1 },
        body: { bid_amount: 100 },
        user: { id: 2 }, // Mock user id
      };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };

      // Mock database responses
      db.query
        .mockResolvedValueOnce([[{ id: 1, owner_id: 2 }]]) // First query response: item exists
        .mockResolvedValueOnce([{ insertId: 1 }]); // Second query response: bid inserted

      await placeBidOnItem(req, res);

      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({
        message: "Bid placed successfully",
        bidId: 1,
      });
    });

    it("should handle invalid bid amount", async () => {
      const req = {
        params: { itemId: 1 },
        body: { bid_amount: "invalid" },
        user: { id: 2 }, // Mock user id
      };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };

      await placeBidOnItem(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ error: "Invalid bid amount" });
    });

    it("should return error if item not found", async () => {
      const req = {
        params: { itemId: 1 },
        body: { bid_amount: 100 },
        user: { id: 2 }, // Mock user id
      };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };

      db.query.mockResolvedValueOnce([[]]); // Mock item not found

      await placeBidOnItem(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ error: "Item not found" });
    });

    it("should return error if user is not the owner of the item", async () => {
      const req = {
        params: { itemId: 1 },
        body: { bid_amount: 100 },
        user: { id: 3 }, // Mock user id
      };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };

      db.query.mockResolvedValueOnce([[{ id: 1, owner_id: 2 }]]); // Mock item with different owner

      await placeBidOnItem(req, res);

      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith({
        error: "You are not authorized to place a bid on this item",
      });
    });

    it("should handle errors during bid placement", async () => {
      const req = {
        params: { itemId: 1 },
        body: { bid_amount: 100 },
        user: { id: 2 }, // Mock user id
      };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };

      db.query.mockRejectedValueOnce(new Error("Database error")); // Mock database error

      await placeBidOnItem(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: "Internal server error" });
    });
  });

  describe("getAllBidsForItem", () => {
    it("should get all bids for an item", async () => {
      const req = { params: { itemId: 1 } };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };

      const mockBids = [
        {
          id: 1,
          item_id: 1,
          user_id: 2,
          bid_amount: 100,
          username: "testUser",
          item_name: "testItem",
        },
      ];

      db.query.mockResolvedValueOnce([mockBids]); // Mock database response

      await getAllBidsForItem(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ bids: mockBids });
    });

    it("should handle errors during fetching bids", async () => {
      const req = { params: { itemId: 1 } };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };

      db.query.mockRejectedValueOnce(new Error("Database error")); // Mock database error

      await getAllBidsForItem(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: "Internal server error" });
    });
  });
});
