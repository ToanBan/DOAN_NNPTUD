var express = require("express");
var router = express.Router();

let {
  register,
  login,
  refreshToken,
  getInfoUser,
  logout,
  googleCallback,
} = require("../controllers/auth");
let passport = require("passport");
let {verifyAccessToken, verifyRefreshToken} = require("../middleware/auth")
const { RegisterValidator, handleValidationErrors } = require("../utils/validatorHandler");

router.post("/register", RegisterValidator, handleValidationErrors, register);
router.post("/login", login);

router.post("/refresh-token", verifyRefreshToken, refreshToken);
router.get("/me", verifyAccessToken, getInfoUser);
router.post("/logout", verifyAccessToken, logout);

router.get(
  "/google",
  passport.authenticate("google", { scope: ["profile", "email"] }),
);

router.get(
  "/google/callback",
  passport.authenticate("google", { session: false }),
  googleCallback,
);
module.exports = router;
