const express = require("express");
const mongoose = require("mongoose");
const path = require("path");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");
const { reviewSchema } = require("./joiSchema");
const cookieParser=require("cookie-parser");
const session=require("express-session");
const flash=require("connect-flash");
const passport=require("passport");
const passportLocal=require("passport-local");
//models
const Listing = require("./models/listing");
const Review = require("./models/review");
const User=require("./models/user");
//express-routers
const listingRouter = require("./routes/listing");
const reviewRouter = require("./routes/review");
const userRouter=require("./routes/user");
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

//Sessions part
const sessionOptions={
    secret:"supersecretcode",
    resave:false,
    saveUninitialized:true,
    cookie:{
        expires:Date.now()+7*24*60*60*1000,
        maxAge:7*24*60*60*1000,
        httpOnly:true
    }
}
app.use(session(sessionOptions));
app.use(flash());

app.use(passport.initialize());
app.use(passport.session());
passport.use(new passportLocal(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

//<------------Routes----------------->
app.get("/", (req, res) => {
    // res.cookie("a","bd");
    // console.dir(req.cookies);
    res.redirect("/listing");
});

//flash session middleware
app.use((req,res,next)=>{
    res.locals.success=req.flash("success");
    res.locals.error=req.flash("error");
    next();
})

app.get("/demoUser",async (req,res)=>{
    let fakeUser=new User({
        email:"a@g.c",
        username:"aa"
    })
    const newUser=await User.register(fakeUser,"qwerty");
    res.send(newUser);
})

app.use("/listing", listingRouter);
app.use("/listing/:id/review", reviewRouter);
app.use("/user", userRouter);

app.get("/loadSampleData",(req,res)=>{
    require("./init/init");  //To reload the sample data
    req.flash("success","Sample Data Loaded Successfully!");
    res.redirect("/");
})

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
