const express=require("express");
const mongoose=require("mongoose");
const path=require("path");

const app=express();
main().catch(err => console.log(err));
async function main() {
  await mongoose.connect('mongodb://127.0.0.1:27017/tripEasy');
}

app.set("views",path.join(__dirname,"views"));
app.set("view engine","ejs");
app.use(express.static(path.join(__dirname,"public")));
app.use(express.urlencoded({extended:true}));

app.get("*",(req,res)=>{
    res.render("noPage");
});

app.listen(3000,()=>{
    console.log("Working");
});
