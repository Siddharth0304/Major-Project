const express=require("express");
const router=express.Router({mergeParams:true});
const wrapAsync=require("../utils/wrapAsync.js");
const Listing=require("../models/listing.js");
const {isLoggedIn, isOwner, validateListing}=require("../middleware.js")
const listingController=require("../controllers/listings.js");
const multer  = require('multer');
const {storage}=require("../cloudConfig.js");
const upload=multer({storage});

router.route("/")
    .get(wrapAsync(listingController.index))  //ALL LISTINGS
    .post(isLoggedIn,upload.single("listing[image]"),validateListing,wrapAsync(listingController.createListing)); //POST ROUTE FOR NEW LISTING
    

//NEW LISTING
router.get("/new",isLoggedIn,listingController.renderNewForm);

router.route("/:id")
    .get(wrapAsync(listingController.showListing)) //SHOW LISTING
    .put(isLoggedIn,isOwner,upload.single("listing[image]"),validateListing,wrapAsync(listingController.updateListing)) //UPDATE LISTING ROUTE
    .delete(isLoggedIn,isOwner,wrapAsync(listingController.destroyListing)); //DELETE LISTING
    


//EDIT LISTING FORM
router.get("/:id/edit",isLoggedIn,isOwner,wrapAsync(listingController.renderEditForm))

module.exports=router;