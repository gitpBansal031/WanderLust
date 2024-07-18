// require("./init/init");  //To reload the sample data
const express = require("express");
const mongoose = require("mongoose");
const path = require("path");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");
const { reviewSchema } = require("./joiSchema");
const cookieParser=require("cookie-parser");

//models
const Listing = require("./models/listing");
const Review = require("./models/review");

//exporess-routers
const listingRouter = require("./routes/listing");
const reviewRouter = require("./routes/review");

//Miscellaneous
const wrapAsync = require("./utils/wrapAsync");
const expressError = require("./utils/expressError");

//<-------------Additional Settings-------------->
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
app.use(cookieParser());


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

//<------------Routes----------------->
app.get("/", (req, res) => {
    // res.cookie("a","bd");
    // console.dir(req.cookies);
    res.redirect("/listing");
});

app.use("/listing", listingRouter);
app.use("/listing/:id/review", reviewRouter);

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
