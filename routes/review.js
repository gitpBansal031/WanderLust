const express = require("express");
const router = express.Router({ mergeParams: true });
const wrapAsync = require("../utils/wrapAsync");
const {isLoggedIn, isReviewOwner}=require("../middleware");
//models
const Listing = require("../models/listing");
const Review = require("../models/review");
//controllers
const reviewController=require("../controllers/review");

//<--------------Routes------------->

// When submit review is clicked, then this route will trigger and create a review (logic part of creating a review)
router.post("/",isLoggedIn,wrapAsync(reviewController.createReview));

//When delete button is clicked, this route will trigger and review will be deleted (logic part of deleting a review)
router.delete("/:reviewId",isReviewOwner,isLoggedIn,wrapAsync(reviewController.deleteReview));

module.exports=router;