// Middleware to check if user is admin
const isAdmin = (req, res, next) => {
  if (req.user.role !== "admin") {
    return res
      .status(403)
      .json({ error: "You are not authorized to perform this action" });
  }
  next();
};

module.exports = { isAdmin };
