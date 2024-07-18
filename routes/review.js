const express = require("express");
const router = express.Router({ mergeParams: true });
const wrapAsync = require("../utils/wrapAsync");
const expressError = require("../utils/expressError");
//models
const Listing = require("../models/listing");
const Review = require("../models/review");

//<--------------Routes------------->

// When submit review is clicked, then this route will trigger and create a review (logic part of creating a review)
router.post("/", wrapAsync(async (req, res) => {
    const { id } = req.params;
    const currListing = await Listing.findById(id); //get the particular listing
    const newReview = new Review(req.body.review); //make a new review
    currListing.reviews.push(newReview); //add review to that particular listing
    await newReview.save(); //Save a new review in the 'reviews' collection
    await currListing.save(); //Save the listing in 'listings' collection with new review (it wont make a new listing)
    req.flash("success","New Review Created!");
    res.redirect(`/listing/show/${id}`);
}))

//When delete button is clicked, this route will trigger and review will be deleted (logic part of deleting a review)
router.delete("/:reviewId",wrapAsync(async (req,res)=>{
    const {id,reviewId}=req.params;
    await Listing.findByIdAndUpdate(id,{$pull:{reviews:reviewId}});
    await Review.findByIdAndDelete({_id:reviewId});
    req.flash("success","Review Deleted!");
    res.redirect(`/listing/show/${id}`);
}))

module.exports=router;