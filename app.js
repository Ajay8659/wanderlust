
const express = require("express");
const app = express();
const mongoose = require("mongoose");
const path = require("path");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");
const wrapAsync = require("./utils/wrapAscync.js");
const ExpressError = require("./utils/ExpressError.js");
const listingRouter = require("./routes/listing.js");
const reviewRouter = require("./routes/review.js");
const userRouter = require("./routes/user.js");
const session = require("express-session");
const flash = require("connect-flash");
const passport = require("passport");
const User = require("./models/user.js");
const localStrategy = require("passport-local");
const Listing = require("./models/listing.js");
const { setHeapSnapshotNearHeapLimit } = require("v8");

// MongoDB connection URL
// const MONGO_URL = "mongodb://127.0.0.1:27017/wanderlust";

const MONGO_URL =
  "mongodb+srv://mongodb:ajay123@cluster0.uw24ovi.mongodb.net/wanderlust?retryWrites=true&w=majority&appName=Cluster0";

// Database Error Handling
main()
  .then(() => {
    console.log("connected to DB");
  })
  .catch((err) => {
    console.log(err);
  });

// Connecting to MongoDB using mongoose
async function main() {
  await mongoose.connect(MONGO_URL);
}

//Setting up EJS as the view engine and using ejsMate for layout support and required Middlewares
app.engine("ejs", ejsMate);
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.static(path.join(__dirname, "public")));
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));

//creating a sessionoption object
const sessionOption = {
  secret: "mySuperSecretCode",
  resave: false,
  saveUninitialized: true,
  cookie: {
    httpOnly: true,
    secure: false, // Set to true if using HTTPS
    expire: Date.now() + 7 * 60 * 60 * 24 * 1000, // 7 days
    maxAge: 1000 * 60 * 60 * 24 * 7, // 7 days
  },
};

//Express Session Middleware
app.use(session(sessionOption));
//Flash Middleware
app.use(flash());

//Passport Middleware
app.use(passport.initialize());
app.use(passport.session());
//Passport Local Strategy for user authentication
passport.use(new localStrategy(User.authenticate()));
//Serializing and Deserializing User
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

//Setting up local variables for flash messages
app.use((req, res, next) => {
  res.locals.currentUser = req.user; // Set current user for views
  res.locals.success = req.flash("success");
  res.locals.error = req.flash("error");
  next();
});

app.use("/listings", listingRouter);
app.use("/listings/:id/reviews", reviewRouter);
app.use("/", userRouter);

app.get(
  "/",
  wrapAsync(async (req, res, next) => {
    const allListings = await Listing.find({});
    res.render("listings/index.ejs", { allListings });
  })
);

// 404 Route
app.all(
  "*",
  wrapAsync(async (req, res, next) => {
    next(new ExpressError("Page not Found", 404));
  })
);

//Error Handling Middleware
app.use((err, req, res, next) => {
  const { status = 500, message = "Somthing went wrong" } = err;
  res.render("error.ejs", { message });
});

//Server Listening
app.listen(3000, () => {
  console.log("server is listening to port 3000");
});
