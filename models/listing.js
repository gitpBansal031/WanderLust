const mongoose=require("mongoose");
const defaultLink="https://www.bsr.org/images/heroes/bsr-travel-hero..jpg";
const listingSchema=new mongoose.Schema({
    title:{
        type:String,
        reqquired:true
    },
    description:{
        type:String
    },
    image:{
        type:String,
        default: defaultLink,
        set: (v)=> v===""?defaultLink:v
    },
    price:{
        type:Number
    },
    location:{
        type:String
    },
    country:{
        type:String
    },

});
const Listing =mongoose.model("Listing",listingSchema);
module.exports=Listing;