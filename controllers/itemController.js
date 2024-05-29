const db = require("../dbConfig/db");
const { uploadOnCloudinary } = require("../utils/uploadCloudinary"); // Corrected import statement

exports.createItem = async (req, res) => {
    const { name, description, starting_price, end_time } = req.body;
    const userId = req.user.id;
  
    if (!name || !description || !starting_price || !end_time) {
      return res.status(400).json({ error: "All fields are required" });
    }
  
    let imageUrl = null;
    if (req.file) {
      try {
        const uploadResult = await uploadOnCloudinary(req.file.path);
        if (uploadResult) {
          imageUrl = uploadResult.secure_url;
        } else {
          return res.status(500).json({ error: "Image upload failed" });
        }
      } catch (error) {
        console.error("Error uploading image:", error);
        return res.status(500).json({ error: "Image upload failed" });
      }
    }
  
    try {
      const [result] = await db.query(
        "INSERT INTO items (owner_id, name, description, starting_price, current_price, image_url, end_time, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, NOW())",
        [userId, name, description, starting_price, starting_price, imageUrl, end_time]
      );
  
      res.status(201).json({
        id: result.insertId,
        owner_id: userId,
        name,
        description,
        starting_price,
        current_price: starting_price,
        imageUrl,
        end_time,
      });
    } catch (error) {
      console.error("Error creating item:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  };
  

// get all items with pagination
exports.getAllItems = async (req, res) => {
  // Pagination parameters
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const offset = (page - 1) * limit;

  try {
    // get items from db with pagination, filtered by auction start and end time
    const [items] = await db.query(
      "SELECT * FROM items WHERE end_time > NOW() LIMIT ? OFFSET ?",
      [limit, offset]
    );

    res.status(200).json({ items });
  } catch (error) {
    console.error("Error fetching items:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

exports.getItemById = async (req, res) => {
  const itemId = req.params.id;

  try {
    // get item by ID from the database
    const [item] = await db.query("SELECT * FROM items WHERE id = ?", [itemId]);

    if (!item.length) {
      return res.status(404).json({ error: "Item not found" });
    }

    res.status(200).json({ item: item[0] });
  } catch (error) {
    console.error("Error fetching item:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Update an auction item by ID
exports.updateItem = async (req, res) => {
    const { current_price } = req.body;
    const itemId = req.params.id;
    const userId = req.user.id; // Getting the userId from middleware
  
    try {
      // Check if the item exists and the user is authorized to update it
      const [existingItem] = await db.query(
        "SELECT * FROM items WHERE id = ? AND (owner_id = ? OR role = 'admin')",
        [itemId, userId]
      );
  
      if (!existingItem) {
        return res.status(404).json({ error: "Item not found or unauthorized" });
      }
  
      // Update the item in the database
      await db.query(
        "UPDATE items SET current_price = ? WHERE id = ?",
        [current_price, itemId]
      );
  
      res.status(200).json({ message: "Item updated successfully" });
    } catch (error) {
      console.error("Error updating item:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  };
  
// Delete an auction item by ID
exports.deleteItem = async (req, res) => {
  const itemId = req.params.id;
  const userId = req.user.id; // Assuming user ID is available in request object after authentication

  try {
    // Check if the item exists and the user is authorized to delete it
    const [existingItem] = await db.query(
      "SELECT * FROM items WHERE id = ? AND (user_id = ? OR role = 'admin')",
      [itemId, userId]
    );

    if (!existingItem) {
      return res.status(404).json({ error: "Item not found or unauthorized" });
    }

    // Delete the item from the database
    await db.query("DELETE FROM items WHERE id = ?", [itemId]);

    res.status(200).json({ message: "Item deleted successfully" });
  } catch (error) {
    console.error("Error deleting item:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};
