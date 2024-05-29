const db = require("../dbConfig/db");
const {
  createItem,
  getAllItems,
  getItemById,
  updateItem,
  deleteItem,
} = require("../controllers/itemController");
const { uploadOnCloudinary } = require("../utils/uploadCloudinary");

jest.mock("../dbConfig/db", () => ({
  query: jest.fn(),
}));

jest.mock("../utils/uploadCloudinary", () => ({
  uploadOnCloudinary: jest.fn(),
}));

describe("Item Controller", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("createItem", () => {
    it("should create a new item", async () => {
      const req = {
        body: {
          name: "Test Item",
          description: "Test Description",
          starting_price: 100,
          end_time: "2024-06-01",
        },
        user: { id: 1 },
        file: { path: "test/image.jpg" },
      };
      const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };

      uploadOnCloudinary.mockResolvedValueOnce({ secure_url: "test/url" });
      db.query.mockResolvedValueOnce([{ insertId: 1 }]);

      await createItem(req, res);

      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({
        id: 1,
        owner_id: 1,
        name: "Test Item",
        description: "Test Description",
        starting_price: 100,
        current_price: 100,
        imageUrl: "test/url",
        end_time: "2024-06-01",
      });
    });

    it("should handle errors during item creation", async () => {
      const req = {
        body: {
          name: "Test Item",
          description: "Test Description",
          starting_price: 100,
          end_time: "2024-06-01",
        },
        user: { id: 1 },
        file: { path: "test/image.jpg" },
      };
      const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };

      uploadOnCloudinary.mockRejectedValueOnce(new Error("Upload Error"));

      await createItem(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: "Image upload failed" });
    });

    it("should return error if required fields are missing", async () => {
      const req = {
        body: { name: "Test Item" },
        user: { id: 1 },
      };
      const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };

      await createItem(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ error: "All fields are required" });
    });
  });

  describe("getAllItems", () => {
    it("should get all items with pagination", async () => {
      const req = { query: { page: 1, limit: 10 } };
      const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };

      db.query.mockResolvedValueOnce([[{ id: 1, name: "Item 1" }]]);

      await getAllItems(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ items: [{ id: 1, name: "Item 1" }] });
    });

    it("should handle errors during item retrieval", async () => {
      const req = { query: { page: 1, limit: 10 } };
      const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };

      db.query.mockRejectedValueOnce(new Error("Database Error"));

      await getAllItems(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: "Internal server error" });
    });
  });

  describe("getItemById", () => {
    it("should get item by ID", async () => {
      const req = { params: { id: 1 } };
      const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };

      db.query.mockResolvedValueOnce([[{ id: 1, name: "Item 1" }]]);

      await getItemById(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ item: { id: 1, name: "Item 1" } });
    });

    it("should handle errors during item retrieval by ID", async () => {
      const req = { params: { id: 1 } };
      const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };

      db.query.mockRejectedValueOnce(new Error("Database Error"));

      await getItemById(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: "Internal server error" });
    });

    it("should handle item not found", async () => {
      const req = { params: { id: 1 } };
      const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };

      db.query.mockResolvedValueOnce([[]]);

      await getItemById(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ error: "Item not found" });
    });
  });

  describe("updateItem", () => {
    it("should update an item", async () => {
      const req = { params: { id: 1 }, body: { current_price: 150 }, user: { id: 1 } };
      const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };

      db.query.mockResolvedValueOnce([[{ id: 1, owner_id: 1 }]]);

      await updateItem(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ message: "Item updated successfully" });
    });

    it("should handle errors during item update", async () => {
      const req = { params: { id: 1 }, body: { current_price: 150 }, user: { id: 1 } };
      const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };

      db.query.mockRejectedValueOnce(new Error("Database Error"));

      await updateItem(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: "Internal server error" });
    });

    it("should handle item not found during update", async () => {
      const req = { params: { id: 1 }, body: { current_price: 150 }, user: { id: 1 } };
      const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };

      db.query.mockResolvedValueOnce([[]]);

      await updateItem(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ error: "Item not found or unauthorized" });
    });
  });

  describe("deleteItem", () => {
    it("should delete an item", async () => {
      const req = { params: { id: 1 }, user: { id: 1 } };
      const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };

      db.query.mockResolvedValueOnce([[{ id: 1, owner_id: 1 }]]);

      await deleteItem(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ message: "Item deleted successfully" });
    });

    it("should handle errors during item deletion", async () => {
      const req = { params: { id: 1 }, user: { id: 1 } };
      const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };

      db.query.mockRejectedValueOnce(new Error("Database Error"));

      await deleteItem(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: "Internal server error" });
    });

    it("should handle item not found during deletion", async () => {
      const req = { params: { id: 1 }, user: { id: 1 } };
      const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };

      db.query.mockResolvedValueOnce([[]]);

      await deleteItem(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ error: "Item not found or unauthorized" });
    });
  });
});
