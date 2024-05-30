const { userRegister, login, profile, changeCurrentPassword } = require("../controllers/userControllers");

const express = require("express");
const { verifyJWT } = require("../middlewares/authMiddleware");
const router = express.Router();

router.post("/register", userRegister);
router.post("/login", login);
router.get("/profile",verifyJWT, profile);
router.post("/change-password",verifyJWT,changeCurrentPassword );

module.exports = router;
