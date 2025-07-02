const express = require("express");
const router = express.Router();
const wrapAsync = require("../utils/wrapAscync.js");
const Listing = require("../models/listing.js");
const ExpressError = require("../utils/ExpressError.js");
const { listingSchema } = require("../utils/joiValidatoin.js");
const { isLoggedin, validateListingOwner } = require("../middleware.js");

//Validation Middleware
const validateListing = (req, res, next) => {
  const { error } = listingSchema.validate(req.body);
  if (error) {
    const msg = error.details.map((el) => el.message).join(",");
    throw new ExpressError(msg, 400);
  } else {
    next();
  }
};

//Index Route
router.get(
  "/",
  wrapAsync(async (req, res, next) => {
    const allListings = await Listing.find({});
    res.render("listings/index.ejs", { allListings });
  })
);

//New Route
router.get("/new", isLoggedin, (req, res) => {
  res.render("listings/new.ejs");
});

//Show Route
router.get(
  "/:id",
  wrapAsync(async (req, res, next) => {
    let { id } = req.params;
    const listing = await Listing.findById(id)
      .populate({path: "reviews", populate: { path: "author" }})
      .populate("owner")
    // Check if the listing exists
    if (!listing) {
      req.flash("error", "Listing not found");
      return res.redirect("/listings");
    }
    res.render("listings/show.ejs", { listing });
  })
);

//Create Route
router.post(
  "/",
  isLoggedin,
  validateListing,
  wrapAsync(async (req, res, next) => {
    const newListing = new Listing(req.body.listing);
    newListing.owner = req.user._id; // Set the owner to the logged-in user
    await newListing.save();
    req.flash("success", "Successfully created a new listing!");
    res.redirect("/listings");
  })
);

//Edit Route
router.get(
  "/:id/edit",
  validateListingOwner,
  isLoggedin,
  wrapAsync(async (req, res) => {
    let { id } = req.params;
    const listing = await Listing.findById(id);
    res.render("listings/edit.ejs", { listing });
  })
);

//Update Route
router.put(
  "/:id",
  validateListing,
  wrapAsync(async (req, res) => {
    let { id } = req.params;
    await Listing.findByIdAndUpdate(id, { ...req.body.listing });
    res.redirect(`/listings/${id}`);
  })
);

//Delete Route
router.delete(
  "/:id",
  validateListingOwner,
  isLoggedin,
  wrapAsync(async (req, res) => {
    let { id } = req.params;
    await Listing.findByIdAndDelete(id);
    req.flash("success", "Listing Deleted!");
    res.redirect("/listings");
  })
);

module.exports = router;