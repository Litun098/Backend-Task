const db = require("../dbConfig/db");

exports.placeBidOnItem = async (req, res) => {
  const { itemId } = req.params;
  const { bid_amount } = req.body;
  const userId = req.user.id; // Assuming user ID is available in request object after authentication

  try {
    // Check if the bid amount is valid
    if (!bid_amount || isNaN(bid_amount) || bid_amount <= 0) {
      return res.status(400).json({ error: "Invalid bid amount" });
    }

    // Check if the item exists and get the owner_id
    const [item] = await db.query("SELECT * FROM items WHERE id = ?", [itemId]);
    if (!item || item.length === 0) {
      return res.status(404).json({ error: "Item not found" });
    }

    // Check if the user is the owner of the item
    const ownerId = item[0].owner_id;
    if (userId !== ownerId) {
      return res
        .status(403)
        .json({ error: "You are not authorized to place a bid on this item" });
    }

    // Insert the new bid into the database
    const [result] = await db.query(
      "INSERT INTO bids (item_id, user_id, bid_amount) VALUES (?, ?, ?)",
      [itemId, userId, bid_amount]
    );

    res
      .status(201)
      .json({ message: "Bid placed successfully", bidId: result.insertId });
  } catch (error) {
    console.error("Error placing bid:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

exports.getAllBidsForItem = async (req, res) => {
  const itemId = req.params.itemId;

  try {
    // Get all bids of the specified item along with the usernames and item name
    const [bids] = await db.query(
      `
        SELECT bids.*, users.username, items.name as item_name 
        FROM bids 
        JOIN users ON bids.user_id = users.id 
        JOIN items ON bids.item_id = items.id 
        WHERE bids.item_id = ?
      `,
      [itemId]
    );

    res.status(200).json({ bids });
  } catch (error) {
    console.error("Error fetching bids:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};
