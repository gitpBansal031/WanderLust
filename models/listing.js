const mongoose = require("mongoose");
const Review = require("./review");
const defaultLink = "https://www.bsr.org/images/heroes/bsr-travel-hero..jpg";
const listingSchema = new mongoose.Schema({
    title: {
        type: String,
        reqquired: true
    },
    description: {
        type: String
    },
    image: {
        type: String,
        default: defaultLink,
        set: (v) => v === "" ? defaultLink : v
    },
    price: {
        type: Number
    },
    location: {
        type: String
    },
    country: {
        type: String
    },
    //using the concept of 1xn databaseRelationship
    //here we are storing the ids of the reviews related to that listing
    reviews: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Review"
    },
    ],
});

//This we have made a handling deletion post middleware so that whenever a listing is deleted its all corresponding reviews are deleted
listingSchema.post("findOneAndDelete", async (listing) => {
    if (listing) {
        await Review.deleteMany({ _id: { $in: listing.reviews } });
    }
})
const Listing = mongoose.model("Listing", listingSchema);
module.exports = Listing;