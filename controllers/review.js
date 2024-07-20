const Listing = require("../models/listing");
const Review = require("../models/review");

//(logic new review)
module.exports.createReview = async (req, res) => {
    const { id } = req.params;
    const currListing = await Listing.findById(id); //get the particular listing
    const newReview = new Review(req.body.review); //make a new review
    newReview.owner = req.user._id;
    currListing.reviews.push(newReview); //add review to that particular listing
    await newReview.save(); //Save a new review in the 'reviews' collection
    await currListing.save(); //Save the listing in 'listings' collection with new review (it wont make a new listing)
    req.flash("success", "New Review Created!");
    res.redirect(`/listing/show/${id}`);
};

//(logic delete review)
module.exports.deleteReview = async (req, res) => {
    const { id, reviewId } = req.params;
    await Listing.findByIdAndUpdate(id, { $pull: { reviews: reviewId } });
    await Review.findByIdAndDelete({ _id: reviewId });
    req.flash("success", "Review Deleted!");
    res.redirect(`/listing/show/${id}`);
};