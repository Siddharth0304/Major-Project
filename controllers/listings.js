const Listing = require("../models/listing")
const mbxGeocoding = require('@mapbox/mapbox-sdk/services/geocoding');
const mapToken=process.env.MAP_TOKEN;
const geocodingClient = mbxGeocoding({ accessToken: mapToken});

module.exports.index=async(req,res)=>{
    const allListings=await Listing.find({})
    res.render("listings/index.ejs",{allListings})
}

module.exports.renderNewForm=(req,res)=>{
    // console.log(req.user);    
    res.render("listings/new.ejs");
}

module.exports.showListing=async(req,res)=>{
    let {id}=req.params;
    let listing=await Listing.findById(id).populate({
        path:"reviews",  //Nesting populate
        populate:{path:"author"}}).populate("owner");
    // console.log(listing)
    if(!listing){
        req.flash("error","Listing Doesn't Exist");
        res.redirect("/listings");
    }
    // console.log(listing);
    res.render("listings/show.ejs",{listing});
}

module.exports.createListing=async(req,res)=>{ 
    let response=await geocodingClient.forwardGeocode({
        query: req.body.listing.location,
        limit : 1,
    })
    .send()
    let url=req.file.path;
    let filename=req.file.filename;   
    const newList=new Listing(req.body.listing);
    newList.image={filename,url};
    newList.owner=req.user._id;
    newList.geometry=response.body.features[0].geometry;
    await newList.save();
    req.flash("success","New Listing Created");
    res.redirect("/listings");
}

module.exports.renderEditForm=async(req,res)=>{
    let {id}=req.params;
    let listing=await Listing.findById(id);
    if(!listing){
        req.flash("error","Listing Doesn't Exist");
        res.redirect("/listings");
    }
    let ImageUrl=listing.image.url;
    ImageUrl=ImageUrl.replace("/upload", "/upload/w_250");
    res.render("listings/edit.ejs",{listing,ImageUrl});
}

module.exports.updateListing=async(req,res)=>{
    let {id}=req.params;
    
    let listing=await Listing.findByIdAndUpdate(id,{...req.body.listing});
    if(typeof req.file!=="undefined"){
        let url=req.file.path;
        let filename=req.file.filename; 
        listing.image={filename,url};
        await listing.save();
    }
    req.flash("success","Listing Updated");
    res.redirect(`/listings/${id}`);
}

module.exports.destroyListing=async(req,res)=>{
    let {id}=req.params;
    if(!listing){
        req.flash("error","Listing Doesn't Exist");
        res.redirect("/listings");
    }
    await Listing.findByIdAndDelete(id);
    req.flash("success","Listing Deleted");
    res.redirect("/listings");
}