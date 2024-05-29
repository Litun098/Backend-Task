const jwt = require("jsonwebtoken");
const db = require('../dbConfig/db')

const verifyJWT = async (req, res, next) => {
  try {
    // Get token from cookie
    const token = req.cookies?.token;

    // If token not found
    if (!token) {
      return res.status(401).json({ message: "Unauthorized access" });
    }

    // Decode token
    const decodedToken = jwt.verify(token, process.env.JWT_SECRET);
    console.log(decodedToken.id);

    // find user of exist in the db
    const [users] = await db.query("SELECT * FROM users WHERE id = ?", [
      decodedToken.id,
    ]);
    const user = users[0];

    // if user not found
    if (!user) {
      throw new ApiError(401, "Invalid access Token");
    }
    
    req.user = user;
    next();
  } catch (error) {
    console.log(error.message);
    return res.status(401).json({ message: "Unauthorized access" });
  }
};
module.exports = { verifyJWT };
