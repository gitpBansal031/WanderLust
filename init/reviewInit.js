const mongoose=require("mongoose");
const model=require("../models/review");

reviewData()
.then(async (ad)=>{
    await model.deleteMany({}).then(()=>{
        console.log("All reviews deleted");
    });
})
.catch(err => console.log(err));

async function reviewData() {
  await mongoose.connect('mongodb://127.0.0.1:27017/tripEasy');
}

module.exports=reviewData;