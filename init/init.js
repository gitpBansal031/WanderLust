const mongoose = require("mongoose");
const Listing = require("../models/listing");
const Review = require("../models/review");
const User = require("../models/user");
let listingData = require("./listingData");
const reviewData = require("./reviewData");
const nameData = require("./nameData");

async function main() {
  await mongoose.connect('mongodb://127.0.0.1:27017/tripEasy');
}

main()
  .then(async () => {
    //delete all the users
    await User.deleteMany({}).then(() => { console.log("All users deleted") });
    //insert admin user
    let adminUser = new User({ username: "admin", email: "a@t" });
    await User.register(adminUser, "a").then(() => { console.log("Admin user inserted") });

    //delete all the existing listings
    await Listing.deleteMany({}).then(() => { console.log("All listing deleted") });
    //reload all the sample listings
    let admin=await User.find({username:"admin"});
    listingData = listingData.map((obj)=>({...obj,owner:admin[0]._id}));
    await Listing.insertMany(listingData).then(() => { console.log("All listing inserted") });

    //delete all the existing reviews
    await Review.deleteMany({}).then(() => { console.log("All reviews deleted") });
    //reload all the sample reviews
    await Review.insertMany(reviewData).then(() => { console.log("All reviews inserted") });

    //Adding review to the listing
    const allListing = await Listing.find({});
    const allReview = await Review.find({});
    adminUser=await User.find({});
    const reviewCount = [6, 3, 5, 3, 3, 4, 3, 4, 2, 2, 4, 4, 4, 4, 2, 5, 3, 4, 4, 4, 3, 4, 2, 4, 2, 4, 4, 2, 2];
    let listingIdx = 0; //listing index counter
    let reviewIdx = 0; //review index counter
    for (let listing of allListing) {
      for (let i = 0; i < reviewCount[listingIdx]; i++) {
        const currReview = allReview[reviewIdx];
        await Review.findByIdAndUpdate(currReview._id, { owner:adminUser[0]._id});
        listing.reviews.push(currReview._id);
        reviewIdx++;
      }
      await Listing.findByIdAndUpdate(listing._id, listing);
      listingIdx++;
    }
    console.log("All reviews added to the listings");
  })
  .catch(err => console.log(err));
  
module.exports = main;