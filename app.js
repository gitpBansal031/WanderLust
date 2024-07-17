// require("./init/init");  //To reload the listing data
// require("./init/reviewInit");  //To delete all reviews
const express = require("express");
const mongoose = require("mongoose");
const path = require("path");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");
const wrapAsync = require("./utils/wrapAsync");
const expressError = require("./utils/expressError");
//models
const Listing = require("./models/listing");
const Review = require("./models/review");
const { reviewSchema } = require("./joiSchema");
const app = express();
app.engine("ejs", ejsMate);

main().catch(err => console.log(err));
async function main() {
    await mongoose.connect('mongodb://127.0.0.1:27017/tripEasy');
}

app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");
app.use(express.static(path.join(__dirname, "public")));
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));

//<----------Functions------------------>

//validation functions
const validateReview = (req, res, next) => {
    let { error } = reviewSchema.validate(req.body);
    if (error) {
        let errMsg = error.details.map((el) => el.message).join(",");
        throw new expressError(400, errMsg);
    } else {
        next();
    }
}

//<--Routes and CRUD Operations-->

//Read (All listings) (Used for home page)
app.get("/listings", wrapAsync(async (req, res, next) => {
    const allListings = await Listing.find();
    res.render("listing/listing.ejs", { allListings });
}));
//Read (Paricular listing) (Used for show.js)
app.get("/listing/show/:id", wrapAsync(async (req, res, next) => {
    const { id } = req.params;
    const listing = await Listing.findById(id).populate("reviews");
    if (listing == null) return next(err);
    res.render("listing/show.ejs", { listing });
}));

//Create (Used for new.js)
app.get("/listing/new", (req, res, next) => {
    res.render("listing/new.ejs");
});

//Update (Used for update.js)
app.get("/listing/update/:id", wrapAsync(async (req, res, next) => {
    const { id } = req.params;
    const listing = await Listing.findById(id);
    res.render("listing/update.ejs", { listing });
}));
//Delete
app.get("/listing/delete/:id", wrapAsync(async (req, res, next) => {
    const { id } = req.params;
    await Listing.findByIdAndDelete(id);  //it will call the middleware in ./models/listing.js file to delete all reviews associated with it
    res.redirect("/listings");
}));

//Other Routes

//When submit button is clicked, this route will trigger and a new listing will create (logic part of creating a new listing)
app.post("/listings", wrapAsync(async (req, res, next) => {
    const obj = req.body.Listing;
    for (let key in obj) {
        const val = obj[key];
        if (key != 'image' && (val == '' || val == null || val == undefined)) {
            throw new expressError(400, "One or more required field are empty");
            return;
        }
    }
    const newListing = new Listing(req.body.Listing);
    await newListing.save(); //to save a single listing.(that insertMany method can also be used)
    res.redirect("/listings");
}
));

//When update button is clicked, this route will trigger and update the changes (logic part of updating a listing)
app.put("/listing/:id", wrapAsync(async (req, res, next) => {
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
    res.redirect("/listings");
}));

// When submit review is clicked, then this route will trigger and create a review (logic part of creating a review)
app.post("/listing/:id/reviews", wrapAsync(async (req, res) => {
    const { id } = req.params;
    const currListing = await Listing.findById(id); //get the particular listing
    const newReview = new Review(req.body.review); //make a new review
    currListing.reviews.push(newReview); //add review to that particular listing
    await newReview.save(); //Save a new review in the 'reviews' collection
    await currListing.save(); //Save the listing in 'listings' collection with new review (it wont make a new listing)
    res.redirect(`/listing/show/${id}`);
}))

//When delete button is clicked, this route will trigger and review will be deleted (logic part of deleting a review)
app.delete("/listing/:id/review/:reviewId",wrapAsync(async (req,res)=>{
    const {id,reviewId}=req.params;
    await Listing.findByIdAndUpdate(id,{$pull:{reviews:reviewId}});
    await Review.findByIdAndDelete({_id:reviewId});
    res.redirect(`/listing/show/${id}`);
}))
//Miscellaneous routes
app.get("/", (req, res) => {
    res.redirect("/listings");
});

app.all("*", (req, res, next) => {
    next(new expressError(401, "Page not found!"));
});
//Routes end

//Error middleware..
app.use((err, req, res, next) => {
    let { statusCode = 404, message = "Something went wrong!" } = err;
    if (message == `Listing validation failed: price: Cast to Number failed for value "w" (type string) at path "price"`) {
        message = "Invalid entry in one or more fields. Please fill the form again.";
    } else if (message.substring(0, 33) == "Cast to ObjectId failed for value" || message == "err is not defined") {
        message = "Page not found!";
    }
    res.render("listing/error.ejs", { message });
});

//Server
app.listen(3000, () => {
    console.log("Server started");
});
