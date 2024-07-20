const mongoose=require("mongoose");
const passportLocalMongoose=require("passport-local-mongoose");
const userSchema=new mongoose.Schema({
    //no need to add passport and username as keys they are by-default available in passport (you can if you want but it won't make a difference)
    email:{
        type:String,
        required:true
    }
})
userSchema.plugin(passportLocalMongoose);
const userModel=mongoose.model("User",userSchema);
module.exports=userModel;