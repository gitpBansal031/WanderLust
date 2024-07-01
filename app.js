const express=require("express");
const mongoose=require("mongoose");
const path=require("path");
const Listing=require("./models/listing");
const methodOverride=require("method-override");
const ejsMate=require("ejs-mate");

const app=express();
app.engine("ejs",ejsMate);

main().catch(err => console.log(err));
async function main() {
  await mongoose.connect('mongodb://127.0.0.1:27017/tripEasy');
}

app.set("views",path.join(__dirname,"views"));
app.set("view engine","ejs");
app.use(express.static(path.join(__dirname,"public")));
app.use(express.urlencoded({extended:true}));
app.use(methodOverride("_method"));

//<--CRUD Operations and Routes-->

//All listings (Read)
app.get("/listings",async (req,res)=>{
    const allListings= await Listing.find();
    res.render("listing/listing.ejs",{allListings});
});
//Create
app.post("/listings",async (req,res)=>{
    const newListing=new Listing(req.body.Listing);
    await newListing.save();
    res.redirect("/listings");
})
//Update
app.put("/listing/:id",async (req,res)=>{
    const {id}=req.params;
    await Listing.findByIdAndUpdate(id,{...req.body.Listing});
    res.redirect("/listings");
})
//Delete
app.get("/listing/delete/:id",async (req,res)=>{
    const {id}=req.params;
    await Listing.findByIdAndDelete(id);
    res.redirect("/listings");
});

//Routes
app.get("/listing/update/:id",async (req,res)=>{
    const {id}=req.params;
    const listing=await Listing.findById(id);
    res.render("listing/update.ejs",{listing});
})

app.get("/listing/new",(req,res)=>{
    res.render("listing/new.ejs");
});

app.get("/listing/show/:id",async (req,res)=>{
    const {id}=req.params;
    const listing=await Listing.findById(id);
    res.render("listing/show.ejs",{listing});
});
app.get("/",(req,res)=>{
    res.redirect("/listings");
})

app.get("*",(req,res)=>{
    res.render("noPage");
});

//Server
app.listen(3000,()=>{
    console.log("Server started");
});
