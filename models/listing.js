const mongoose=require("mongoose");
const defaultLink="https://business.booking.com/storage/assets/media/34/homepage-booking-us-v1_ac2bada813f142765fe9b4f3fbe3e3da59f0864429.webp";
const listingSchema=new mongoose.Schema({
    title:{
        type:String,
        reqquired:true
    },
    description:{
        type:String
    },
    iddmage:{
        type:String,
        default: defaultLink,
        set: (v)=> v===""?defaultLink:v
    },
    price:{
        type:Number
    },
});
const listing =mongoose.model("Listing",listingSchema);
module.exports=listing;