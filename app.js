if(process.env.NODE_ENV != "production"){
    require('dotenv').config();
}


const express=require("express");
const mongoose=require("mongoose");
const app=express();
const path=require("path");
const methodOverride=require("method-override");
const ejsMate=require("ejs-mate");
const port=8080;
const ExpressError=require("./utils/ExpressError.js");
const listingRouter= require("./routes/listing.js");
const reviewRouter=require("./routes/review.js");
const userRouter=require("./routes/user.js");
const session=require("express-session");
const MongoStore = require('connect-mongo');
const flash=require("connect-flash");
const passport=require("passport");
const LocalStrategy=require("passport-local");
const User=require("./models/user.js");


app.use(methodOverride("_method"))
app.set("view engine","ejs");
app.set("views",path.join(__dirname,"/views"))

app.use(express.urlencoded({extended:true}));
app.use(express.json());
app.use(express.static(path.join(__dirname,"/public")));
app.engine("ejs",ejsMate)


const dbUrl=process.env.ATLASDB_URL;

main().catch((err)=>{
    console.log(err);
})

async function main(){
    await mongoose.connect(dbUrl);
}
const store=MongoStore.create({
    mongoUrl:dbUrl,
    crypto:{
        secret:process.env.SECRET,
    },
    touchAfter:24*3600,
})

store.on("error",()=>{
    console.log("Error in mongo session store",err);
})

const sessionOptions={
    store,
    secret:process.env.SECRET,
    resave:false,
    saveUninitialized:true,
    cookie:{
        expires: Date.now() + (7 * 24 * 60 * 60 * 1000),
        maxAge:7 * 24 * 60 * 60 * 1000,
        httpOnly:true
    },
    
};

// app.get("/",(req,res)=>{
//     res.send("Working");
// })


app.use(session(sessionOptions));
app.use(flash());

app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use((req,res,next)=>{
    res.locals.success=req.flash("success");
    res.locals.error=req.flash("error");
    res.locals.curruser=req.user;
    next();
})

app.use("/listings",listingRouter); // Everything in the routes/listing.js (restructured)
app.use("/listings/:id/reviews",reviewRouter);  // Everything in the routes/review.js (restructured)
app.use("/",userRouter);


app.all('*',(req,res,next)=>{
    next(new ExpressError(404," Page Not Found!"));
})

app.use((err,req,res,next)=>{
    let {status=500,message="Something is wrong"}=err;
    res.render("error.ejs",{err});
    //res.status(status).send(message);
})

app.listen(port,()=>{
    console.log("working");
})

