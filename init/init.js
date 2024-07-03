const mongoose=require("mongoose");
const data=require("./listingData");
const model=require("../models/listing");

fillData()
.then(async (ad)=>{
    await model.deleteMany({});
    await model.insertMany(data).then(()=>{
      console.log("Data inserted");
    });
})
.catch(err => console.log(err));

async function fillData() {
  await mongoose.connect('mongodb://127.0.0.1:27017/tripEasy');
}

module.exports=fillData;