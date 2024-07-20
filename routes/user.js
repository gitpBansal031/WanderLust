const express = require("express");
const router = express.Router({});
const User = require("../models/user");
const wrapAsync = require("../utils/wrapAsync");
const passport = require("passport");
const { saveRedirectUrl, isLoggedIn } = require("../middleware");

//route to signup
router.get("/signup", (req, res) => {
    res.render("users/signup.ejs");
})
//logic part of signup
router.post("/signup",wrapAsync(async (req, res, next) => {
    //try-catch block is to display flash magic if the user exists or not    
    try {
        let { username, email, password } = req.body;
        const newUser = new User({ email, username });
        const registeredUser = await User.register(newUser, password);
        req.login(registeredUser, (err) => {
            if (err) {
                return next(err);
            }
            req.flash("success", "Welcome to TripEasy");
            res.redirect("/listing");
        })
    } catch (e) {
        req.flash("error", e.message);
        res.redirect("/user/signup");
    }
}))

//route to login
router.get("/login", (req, res) => {
    res.render("users/login.ejs");
})
//logic part of login
router.post("/login", saveRedirectUrl,passport.authenticate("local", { failureRedirect: "/user/login", failureFlash: true }), async (req, res) => {
    req.flash("success", "Welcome back to TripEasy");
    const redirectUrl=res.locals.redirectUrl || "/listing";
    res.redirect(redirectUrl);
})

//logout
router.get("/logout", (req, res, next) => {
    req.logOut((err) => {
        if (err) {
            return next(err);
        }
        req.flash("success", "Successfully logged out!");
        res.redirect("/listing");
    })
})

module.exports = router;

// passport.authenticate we used is a in-built middleware to authenticate the input credentials
