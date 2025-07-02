const express = require('express');
const router = express.Router({ mergeParams: true });
const wrapAsync = require("../utils/wrapAscync.js");
const Listing = require("../models/listing.js");
const ExpressError = require("../utils/ExpressError.js");
const { reviewValidation, isReviewOwner } = require("../middleware.js");
const Review = require("../models/review.js");
const { isLoggedin } = require("../middleware.js");

//comment Validation Middleware

//Reviews Route Using Post Method
router.post("/", isLoggedin, reviewValidation, wrapAsync(async (req, res, next) => {
    const { id } = req.params;
    const listing = await Listing.findById(id);
    const newReview = new Review(req.body.review);
    newReview.owner = res.locals.currentUser.username; // Set the owner to the logged-in user
    newReview.createdAt = Date.now();
    newReview.author = res.locals.currentUser._id; // Set the author to the logged-in user
    console.log(newReview);
    listing.reviews.push(newReview);
    await newReview.save();
    await listing.save();
    req.flash("success", "Review Added!");
    res.redirect(`/listings/${id}`);
}));

//Delete Review Route
router.delete("/:reviewId",isReviewOwner, wrapAsync(async (req, res, next) => {
    const { id, reviewId } = req.params;
    await Listing.findByIdAndUpdate(id, { $pull: { reviews: reviewId } });
    await Review.findByIdAndDelete(reviewId);
    req.flash("success", "Review Deleted!");
    res.redirect(`/listings/${id}`);
}
));


module.exports = router;