//Listing routes performing CRUD Operations
const express = require("express");
const router = express.Router({ mergeParams: true });
const wrapAsync = require("../utils/wrapAsync");
const expressError = require("../utils/expressError");
//models
const Listing = require("../models/listing");
const Review = require("../models/review");
const { isLoggedIn, isOwner } = require("../middleware");

//<---------------Routes------------------->

//Read (All listings) (Used for home page)
router.get("/", wrapAsync(async (req, res, next) => {
    const allListings = await Listing.find();
    res.render("listing/listing.ejs", { allListings });
}));

//Read (Paricular listing) (Used for show.js)
router.get("/show/:id", wrapAsync(async (req, res, next) => {
    const { id } = req.params;
    const listing = await Listing.findById(id).populate({ path: "reviews", populate: { path: "owner" } }).populate("owner"); //nested populate
    if (!listing) {
        return next(err);
    }
    res.render("listing/show.ejs", { listing });
}));

//Create (Used for new.js)
router.get("/new", isLoggedIn, (req, res, next) => {
    res.render("listing/new.ejs");
});

//Update (Used for update.js)
router.get("/update/:id", isOwner, isLoggedIn, wrapAsync(async (req, res, next) => {
    const { id } = req.params;
    const listing = await Listing.findById(id);
    res.render("listing/update.ejs", { listing });
}));

//Delete
router.get("/delete/:id", isOwner, isLoggedIn, wrapAsync(async (req, res, next) => {
    const { id } = req.params;
    await Listing.findByIdAndDelete(id);  //it will call the middleware in ./models/listing.js file to delete all reviews associated with it
    req.flash("success", "Listing Deleted!");
    res.redirect("/listing");
}));

//When submit button is clicked, this route will trigger and a new listing will create (logic part of creating a new listing)
router.post("/", wrapAsync(async (req, res, next) => {
    let listingObj = req.body.Listing;
    const ownerId = req.user._id;
    listingObj = { ...listingObj, owner: ownerId }; //adding owner id to the listing obj
    for (let key in listingObj) {
        const val = listingObj[key];
        if (key != 'image' && (val == '' || val == null || val == undefined)) {
            throw new expressError(400, "One or more required field are empty");
            return;
        }
    }
    const newListing = new Listing(listingObj);
    req.flash("success", "New Listing Created!");
    await newListing.save(); //to save a single listing.(that insertMany method can also be used)
    res.redirect("/listing");
}
));

//When update button is clicked, this route will trigger and update the changes (logic part of updating a listing)
router.put("/:id", wrapAsync(async (req, res, next) => {
    const obj = req.body.Listing;
    //to check if all the fields other than image are filled or not
    for (let key in obj) {
        const val = obj[key];
        if (val == '' || val == null || val == undefined) {
            throw new expressError(400, "One or more required field are empty");
            return;
        }
    }
    //if all fields are filled then this follows up
    const { id } = req.params;
    await Listing.findByIdAndUpdate(id, { ...req.body.Listing });
    req.flash("success", "Listing Updated!");
    res.redirect("/listing");
}));

module.exports = router;