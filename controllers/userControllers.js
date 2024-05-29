const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const db = require("../dbConfig/db");

// user registration
exports.userRegister = async (req, res) => {
  try {
    const { username, password, email } = req.body;

    const hashedPassword = await bcrypt.hash(password, 10);

    // Insert the user into the database
    const [user] = await db.query(
      "insert into users (username, password, email) values (?, ?, ?)",
      [username, hashedPassword, email]
    );

    res.status(201).json({ message: "User registered successfully" });
  } catch (error) {
    console.log(error.message);
    res.status(200).json({ msg: "Something went wrong" });
  }
};

// user login
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const [users] = await db.query("SELECT * FROM users WHERE email = ?", [
      email,
    ]);
    const user = users[0];

    const validatePassword = bcrypt.compareSync(password, user.password);
    // Check if user doesn't exists or password is correct
    if (!user || !validatePassword) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    // Generate JWT token
    const token = jwt.sign(
      { id: user.id, email: user.email },
      process.env.JWT_SECRET,
      {
        expiresIn: "10d",
      }
    );

    const options = {
      httpOnly: true,
      secure: true,
    };

    user.password = "";
    res.status(200).cookie("token", token, options).json({ user });
  } catch (error) {
    console.error("Error logging in:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// User Profile
exports.profile = async (req, res) => {
  try {
    // console.log(req.cookies)
    return res.status(200).json({ user: req.user });
  } catch (error) {
    console.error("Error logging in:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};
