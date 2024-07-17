const mongoose=require("mongoose");
const reviewSchema=new mongoose.Schema({
    comment:{
        type:String,
        default:"apple",
    },
    rating:{
        type:Number,
        min:1,
        max:5
    },
    createdAt:{
        type:Date,
        default:Date.now()
    }
})
const reviewModel=mongoose.model("Review",reviewSchema);
module.exports=reviewModel;