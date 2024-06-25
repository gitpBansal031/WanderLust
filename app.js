
if(process.env.NODE_ENV!="production"){
    require("dotenv").config();
}
const express=require('express');
const app=express();
const mongoose=require('mongoose');
const Listing=require("./models/listing.js");
const Review=require("./models/review.js");
const methodOverride=require("method-override");
const ejsMate=require("ejs-mate");
const wrapAsync=require("./utils/wrapAsync.js");
const ExpressError=require("./utils/ExpressError.js");
const {listingSchema,reviewSchema}=require("./schema.js");


const listingRouter=require("./routes/listing.js");
const reviewRouter=require("./routes/review.js");
const userRouter=require("./routes/user.js");
const session=require("express-session");
const MongoStore=require('connect-mongo');
const flash=require("connect-flash");

const path=require("path");

const passport=require("passport");
const LocalStrategy=require("passport-local");
const User=require("./models/user.js");
const { stdout } = require('process');
app.set("view engine","ejs");
app.set("views", path.join(__dirname,"views"));
app.use(express.urlencoded({extended:true}));
app.use(methodOverride("_method"));
app.engine('ejs',ejsMate);
app.use(express.static(path.join(__dirname,"/public")));

 const dbUrl=process.env.ATLASDB_URL;

main().then(()=>{
    console.log("connected to DB");
}).
catch(err=>console.log(err)); 

async function main(){
await mongoose.connect(dbUrl);
};
const store=MongoStore.create({
    mongoUrl:dbUrl,
    crypto:{
        secret:process.env.SECRET,
    },
    touchAfter:24*3600,
});



store.on("error",()=>{
    console.log("Error in Mongo Session Store",err);
});
//using sessions
const sessionOptions={
    store,
    secret:process.env.SECRET,
    resave:false,
    saveUninitialized:true,
    cookie:{
        expires:Date.now()+7*24*60*60*1000,
        maxAge:7*24*60*60*1000,
        httpOnly:true,
    },
};


// app.get('/',(req,res)=>{ //making the api call for root server
//     res.send("Hi..root is working");
// });
// app.get('/',(req,res)=>{
//     res.render("/listings");
// });

app.use(session(sessionOptions));
app.use(flash());


app.use(passport.initialize());//to initialize passport middleware every time we log in
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
// use static serialize and deserialize of model for passport session support
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());



app.use((req,res,next)=>{
   
    res.locals.success=req.flash("success");

    res.locals.error=req.flash("error");
   // console.log(res.locals.error);
     res.locals.currUser=req.user;
    next();
});


// app.get("/demouser",async(req,res)=>{
// let fakeUser=new User({
//     email:"student@gmail.com",
//     username: "delta-student"
// });

// let registeredUser=await User.register(fakeUser,"helloworld");
// res.send(registeredUser);
// });
app.get("/listings/fsearc",async (req,res)=>{
    console.log("hello");
    const { location } = req.query;
    console.log(location);

    try {
        // Retrieve the location value from the request query parameters
        const { location } = req.query;

        // Perform the Mongoose query to find listings based on the location
        const searchResults = await Listing.find({ location: { $regex: location, $options: 'i' } });

        // Render the search results page with the found listings
        res.render('listings/search.ejs', { searchResults });
    } catch (error) {
        // Handle any errors
        console.error('Error searching listings:', error);
        res.status(500).send('Error searching listings');
    }
 });


app.use("/listings",listingRouter);
app.use("/listings/:id/reviews",reviewRouter);
app.use("/",userRouter);






// app.get('/testListening',async (req,res)=>{//this route is made to add a new data into the database using  the schema initialized in the listing.js
// let sampleListing=new Listing({ //creating the new listing based on the Schema defined on lising.js
//     title:"My new Villa",
//     description: "By the beach",
//     price:1200,
//     location:"calangute, Goa",
//     country:"India",
// });

// await sampleListing.save(); //saving data in the database.save() is a async function so we used await.
// console.log("sample was saved");
// res.send("successful testing");
// });



//error handling middleware for server side

app.all("*",(req,res,next)=>{
    next(new ExpressError(404,"page not found"));  
  });


app.use((err,req,res,next)=>{
    let {status=500,message}=err;
    // res.status(status).send(message); ->to print the message on the screen
    res.status(status).render("error.ejs",{err});
});





//search




// Route to handle the search request
// Route handler for rendering search results


app.listen(8080,()=>{ //the working port of localhost where our server is hosted
    console.log("server is listening to port");
});