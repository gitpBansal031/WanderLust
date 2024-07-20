const Listing=require("./models/listing");
module.exports.isLoggedIn=(req,res,next)=>{
    if(!req.isAuthenticated()){
        req.session.redirectUrl=req.originalUrl; //post-login info
        req.flash("error","Log in to TripEasy");
        return res.redirect("/user/login");
    }
    next();
}

module.exports.saveRedirectUrl=(req,res,next)=>{
    if(req.session.redirectUrl){
        res.locals.redirectUrl=req.session.redirectUrl;
    }
    next();
}

module.exports.isOwner=async (req,res,next)=>{
    const { id } = req.params;
    const listing = await Listing.findById(id);
    if(res.locals.currUser && !listing.owner._id.equals(res.locals.currUser._id)){
        req.flash("error","You don't have permission to make changes to the listing");
        return res.redirect(`/listing/show/${id}`);
    }
    next();
}