const Listing = require("../models/listing");

//(show all listings)
module.exports.index = async (req, res, next) => {
    const allListings = await Listing.find();
    res.render("listing/listing.ejs", { allListings });
};

//(show particular listing)
module.exports.renderListing = async (req, res, next) => {
    const { id } = req.params;
    const listing = await Listing.findById(id).populate({ path: "reviews", populate: { path: "owner" } }).populate("owner"); //nested populate
    if (!listing) {
        return next(err);
    }
    res.render("listing/show.ejs", { listing });
};

//(show new listing form)
module.exports.renderNewForm = (req, res, next) => {
    res.render("listing/new.ejs");
};

//(show update listing form)
module.exports.renderUpdateForm = async (req, res, next) => {
    const { id } = req.params;
    const listing = await Listing.findById(id);
    res.render("listing/update.ejs", { listing });
};

//(delete listing logic)
module.exports.deleteListing = async (req, res, next) => {
    const { id } = req.params;
    await Listing.findByIdAndDelete(id);  //it will call the middleware in ./models/listing.js file to delete all reviews associated with it
    req.flash("success", "Listing Deleted!");
    res.redirect("/listing");
};

//(new listing logic)
module.exports.newListing = async (req, res, next) => {
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
};

//(update listing logic)
module.exports.updateListing = async (req, res, next) => {
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
};