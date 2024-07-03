const express = require("express");
const mongoose = require("mongoose");
const path = require("path");
const Listing = require("./models/listing");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");
const wrapAsync = require("./utils/wrapAsync");
const expressError = require("./utils/expressError");
// const fillData=require("./init/init");

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

//<--Routes and CRUD Operations-->

//Read (All listings)
app.get("/listings", wrapAsync(async (req, res, next) => {
    const allListings = await Listing.find();
    res.render("listing/listing.ejs", { allListings });
}));
//Read (Paricular listing)
app.get("/listing/show/:id", wrapAsync(async (req, res, next) => {
    const { id } = req.params;
    const listing = await Listing.findById(id);
    if(listing==null) return next(err);
    res.render("listing/show.ejs", { listing });
}));

//Create
app.post("/listings", wrapAsync(async (req, res, next) => {
    const obj = req.body.Listing;
    for (let key in obj) {
        const val = obj[key];
        if (val == '' || val == null || val == undefined) {
            throw new expressError(400, "One or more required field are empty");
            return;
        }
    }
    const newListing = new Listing(req.body.Listing);
    await newListing.save();
    res.redirect("/listings");
}
));
//Update
app.put("/listing/:id", wrapAsync(async (req, res, next) => {
    const obj = req.body.Listing;
    for (let key in obj) {
        const val = obj[key];
        if (val == '' || val == null || val == undefined) {
            throw new expressError(400, "One or more required field are empty");
            return;
        }
    }
    const { id } = req.params;
    await Listing.findByIdAndUpdate(id, { ...req.body.Listing });
    res.redirect("/listings");
}));
//Delete
app.get("/listing/delete/:id", wrapAsync(async (req, res, next) => {
    const { id } = req.params;
    await Listing.findByIdAndDelete(id);
    res.redirect("/listings");
}));

//Routes
app.get("/listing/update/:id", wrapAsync(async (req, res, next) => {
    const { id } = req.params;
    const listing = await Listing.findById(id);
    res.render("listing/update.ejs", { listing });
}));

app.get("/listing/new", (req, res, next) => {
    res.render("listing/new.ejs");
});

app.get("/", (req, res) => {
    res.redirect("/listings");
});

app.all("*", (req, res, next) => {
    next(new expressError(401, "Page not found!"));
});

//Error middleware..
app.use((err, req, res, next) => {
    let { statusCode = 404, message = "Something went wrong!" } = err;
    if(message==`Listing validation failed: price: Cast to Number failed for value "w" (type string) at path "price"`){
        message="Invalid entry in one or more fields. Please fill the form again.";
    }else if(message.substring(0,33)=="Cast to ObjectId failed for value" || message=="err is not defined"){
        message="Page not found!";
    }
    res.render("listing/error.ejs",{message});
});

//Server
app.listen(3000, () => {
    console.log("Server started");
});
