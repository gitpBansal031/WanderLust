const express=require("express");
const router=express.Router();
const User=require("../models/user.js");
const passport=require("passport");
const {savedRedirectUrl}=require("../middleware.js");
const wrapAsync=require("../utils/wrapAsync");
const listingController = require("../controllers/listings.js");
const userController=require("../controllers/users.js");

router.route("/").get(listingController.index);
router.route("/signup")
.get(userController.renderSignupForm)
.post(userController.signup);
router.route("/login")
.get(userController.renderLoginForm)
.post(savedRedirectUrl,
passport.authenticate("local",
{failureRedirect:"/login",
failureFlash:true,}),
userController.login
);


router.get("/logout",userController.logout);
module.exports=router;
