const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const db = require("../dbConfig/db");
const {
  userRegister,
  login,
  profile,
} = require("../controllers/userControllers");

// Mock dependencies
jest.mock("jsonwebtoken", () => ({
  sign: jest.fn(),
}));

jest.mock("bcryptjs", () => ({
  compareSync: jest.fn(),
  hash: jest.fn(),
}));

jest.mock("../dbConfig/db", () => ({
  query: jest.fn(),
}));

// Test suite for the auth controller
describe("Auth Controller", () => {
  // Reset mocks before each test
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // Test case for user registration
  describe("userRegister", () => {
    it("should register a new user", async () => {
      // Mock request and response objects
      const req = {
        body: {
          username: "testUser",
          password: "testPassword",
          email: "test@example.com",
        },
      };
      const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };

      // Mock bcrypt.hash function to resolve with a hashed password
      bcrypt.hash.mockResolvedValue("hashedPassword");
      // Mock database query function to resolve with a user ID
      db.query.mockResolvedValueOnce([[{ id: 1 }]]);

      // Call the userRegister controller function
      await userRegister(req, res);

      // Expect status to be 201 and return a success message
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({
        message: "User registered successfully",
      });
    });

    it("should handle errors during user registration", async () => {
      // Mock request and response objects
      const req = {
        body: {
          username: "testUser",
          password: "testPassword",
          email: "test@example.com",
        },
      };
      const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };

      // Mock bcrypt.hash function to reject with an error
      bcrypt.hash.mockRejectedValueOnce("Error hashing password");

      // Call the userRegister controller function
      await userRegister(req, res);

      // Expect status to be 200 and return an error message
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ msg: "Something went wrong" });
    });
  });

  // Test case for user login
  describe("login", () => {
    it("should log in a user with valid credentials", async () => {
      // Mock request and response objects
      const req = {
        body: { email: "test@example.com", password: "testPassword" },
      };
      const res = {
        status: jest.fn().mockReturnThis(),
        cookie: jest.fn(),
        json: jest.fn(),
      };

      // Mock database query function to resolve with a user
      db.query.mockResolvedValueOnce([
        [{ id: 1, email: "test@example.com", password: "hashedPassword" }],
      ]);
      // Mock bcrypt.compareSync function to resolve to true
      bcrypt.compareSync.mockReturnValue(true);
      // Mock jwt.sign function to return a token
      jwt.sign.mockReturnValue("token");

      // Call the login controller function
      await login(req, res);

      // Expect status to be 200 and return user data with token
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.cookie).toHaveBeenCalledWith("token", "token", {
        httpOnly: true,
        secure: true,
      });
      expect(res.json).toHaveBeenCalledWith({
        user: { id: 1, email: "test@example.com" },
      });
    });

    it("should handle login with invalid credentials", async () => {
      // Mock request and response objects
      const req = {
        body: { email: "test@example.com", password: "testPassword" },
      };
      const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };

      // Mock database query function to resolve with no user
      db.query.mockResolvedValueOnce([[]]);
      // Mock bcrypt.compareSync function to resolve to false
      bcrypt.compareSync.mockReturnValue(false);

      // Call the login controller function
      await login(req, res);

      // Expect status to be 401 and return error message
      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({
        error: "Invalid email or password",
      });
    });

    it("should handle errors during login", async () => {
      // Mock request and response objects
      const req = {
        body: { email: "test@example.com", password: "testPassword" },
      };
      const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };

      // Mock database query function to reject with an error
      db.query.mockRejectedValueOnce("Database error");

      // Call the login controller function
      await login(req, res);

      // Expect status to be 500 and return error message
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: "Internal server error" });
    });
  });

  // Test case for user profile
  describe("profile", () => {
    it("should return user profile", async () => {
      // Mock request and response objects
      const req = { user: { id: 1, email: "test@example.com" } };
      const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };

      // Call the profile controller function
      await profile(req, res);

      // Expect status to be 200 and return user profile
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        user: { id: 1, email: "test@example.com" },
      });
    });

    it("should handle errors during profile retrieval", async () => {
      // Mock request and response objects
      const req = { user: { id: 1, email: "test@example.com" } };
      const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };

      // Call the profile controller function
      await profile(req, res);

      // Expect status to be 500 and return error message
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: "Internal server error" });
    });
  });
});
