const db = require("../dbConfig/db");
const { uploadOnCloudinary } = require('../utils/uploadCloudinary'); // Corrected import statement

exports.createItem = async (req, res) => {
  const { name, description, starting_price, end_time } = req.body;
  const userId = req.user.id;

  if (!name || !description || !starting_price || !end_time) {
    return res.status(400).json({ error: "All fields are required" });
  }

  console.log(req.file);

  let imageUrl = null;
  if (req.file) {
    try {
      const uploadResult = await uploadOnCloudinary(req.file.path);
      console.log(uploadResult);
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
      "INSERT INTO items (name, description, starting_price, current_price, image_url, end_time, created_at) VALUES (?, ?, ?, ?, ?, ?, NOW())",
      [name, description, starting_price, starting_price, imageUrl, end_time]
    );

    res.status(201).json({
      id: result.insertId,
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
