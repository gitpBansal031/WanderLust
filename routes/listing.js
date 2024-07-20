//Listing routes performing CRUD Operations
const express = require("express");
const router = express.Router({ mergeParams: true });
const wrapAsync = require("../utils/wrapAsync");
const expressError = require("../utils/expressError");
//models
const Listing = require("../models/listing");
const Review = require("../models/review");
const { isLoggedIn, isOwner } = require("../middleware");
//controllers
const listingController = require("../controllers/listing");
//<---------------Routes------------------->

//Read (All listings) (Used for home page)
router.get("/", wrapAsync(listingController.index));

//Read (Paricular listing) (Used for show.js)
router.get("/show/:id", wrapAsync(listingController.renderListing));

//Create (Used for new.js)
router.get("/new", isLoggedIn, listingController.renderNewForm);

//Update (Used for update.js)
router.get("/update/:id", isOwner, isLoggedIn, wrapAsync(listingController.renderUpdateForm));

//Delete
router.get("/delete/:id", isOwner, isLoggedIn, wrapAsync(listingController.deleteListing));

//When submit button is clicked, this route will trigger and a new listing will create (logic part of creating a new listing)
router.post("/", wrapAsync(listingController.newListing));

//When update button is clicked, this route will trigger and update the changes (logic part of updating a listing)
router.put("/:id", wrapAsync(listingController.updateListing));

module.exports = router;