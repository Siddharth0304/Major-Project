const Listing = require("./models/listing");
const Review = require("./models/review.js")
const {listingSchema,reviewSchema}=require("./schema.js");
const ExpressError=require("./utils/ExpressError.js");

module.exports.isLoggedIn=(req,res,next)=>{
    if(!req.isAuthenticated()){
    //post-login page
    req.session.redirectUrl=req.originalUrl;
    req.flash("error","You must me logged in.");
    res.redirect("/login");
    }
    next();
}

module.exports.saveRedirectUrl=(req,res,next)=>{
    if(req.session.redirectUrl){
        res.locals.redirectUrl=req.session.redirectUrl;
    }
    next(); 
}

module.exports.isOwner=async(req,res,next)=>{
    let {id}=req.params;
    let listing=await Listing.findById(id);
    if(res.locals.curruser && !listing.owner._id.equals(res.locals.curruser._id)){
        req.flash("error","You are not the owner of this listing");
        return res.redirect(`/listings/${id}`);
    }
    next();
}

//SERVER LISTING VALIDATION
module.exports.validateListing=(req,res,next)=>{
    let {error}=listingSchema.validate(req.body);
    if(error){
        let erMsg=error.details.map((el)=> el.message).join(",");
        throw new ExpressError(400,error);
    }
    else
        next();
}

//SERVER REVIEW VALIDATION
module.exports.validateReview=(req,res,next)=>{
    let {error}=reviewSchema.validate(req.body);
    if(error){
        let erMsg=error.details.map((el)=> el.message).join(",");
        throw new ExpressError(400,error);
    }
    else
        next();
}

module.exports.isReviewAuthor=async(req,res,next)=>{
    let {id,reviewId}=req.params;
    let review=await Review.findById(reviewId);
    if(res.locals.curruser && !review.author._id.equals(res.locals.curruser._id)){
        req.flash("error","You are not the author of this review");
        return res.redirect(`/listings/${id}`);
    }
    next();
}