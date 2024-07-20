const express = require("express");
const router = express.Router({});
const wrapAsync = require("../utils/wrapAsync");
const passport = require("passport");
const { saveRedirectUrl, isLoggedIn } = require("../middleware");
//controller
const userController = require("../controllers/user");

// <------------routes------------->

//route to signup (both render and logic)
router.route("/signup")
    .get(userController.renderSignup)
    .post(wrapAsync(userController.signup));

//route to login (render and logic)
router.route("/login")
    .get(userController.renderLogin)
    .post(saveRedirectUrl, passport.authenticate("local", { failureRedirect: "/user/login", failureFlash: true }), userController.login)

//logout
router.get("/logout", userController.logout)

module.exports = router;

// passport.authenticate we used is a in-built middleware to authenticate the input credentials
