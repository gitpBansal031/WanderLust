const mongoose=require("mongoose");
const initData =require("./data.js");
const Listing=require("../models/listing.js");
const User=require('../models/user.js');

let Mongo_url="mongodb://127.0.0.1:27017/Wanderlust";
main().then(()=>{
    console.log("connected to DB");
}).
catch(err=>console.log(err));

async function main(){
await mongoose.connect(Mongo_url);
}


const initDB=async()=>{
    await Listing.deleteMany({});
    
    initData.data=initData.data.map((obj)=>({...obj,owner:"65ed9085845be2cf9ad6aa3e"}))
    await Listing.insertMany(initData.data);
    console.log("data was initialized");
};
initDB();