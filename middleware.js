const Listing = require("./models/listing.js");
const {reviewSchema} = require("./utils/joiValidatoin.js");
const Review = require("./models/review.js");

// Middleware to check if the user is logged in
module.exports.isLoggedin = (req, res, next) =>{
    if (!req.isAuthenticated()) {
    req.session.redirectUrl = req.originalUrl;
    req.flash("error", "You are not Logged in Currently! please try to after login");
    return res.redirect("/login");
  }
  next();
}

// Middleware to save the redirect URL after login
module.exports.saveRedirectUrl = (req, res, next) =>{
  if(req.session.redirectUrl){
    res.locals.redirectUrl = req.session.redirectUrl;
  }
  next();
};

// Middleware to validate the listing owner

module.exports.validateListingOwner = async (req, res, next) =>{
 try {
   const {id} = req.params;
   let listing = await Listing.findById(id);
   if(listing.owner._id.equals(res.locals.currentUser._id)){
     return next();
   }
   req.flash("error", "You do not have permission to perform this action");
   return res.redirect(`/listings/${id}`);
 } catch (error) {
  req.flash("error", "Listing not found or you do not have permission to perform this action");
  return res.redirect(`/listings`);
 }
};

module.exports.isReviewOwner = async (req, res, next) =>{
 try {
   const {id,reviewId} = req.params;
   let review = await Review.findById(reviewId);
   if(review.author._id.equals(res.locals.currentUser._id)){
     return next();
   }
   req.flash("error", "You do not have permission to perform this action");
   return res.redirect(`/listings/${id}`);
 } catch (error) {
  req.flash("error", "Listing not found or you do not have permission to perform this action");
  return res.redirect(`/listings`);
 }
};





module.exports.reviewValidation = (req, res, next) => {
    const { error } = reviewSchema.validate(req.body);
    if (error) {
        const msg = error.details.map((el) => el.message).join(',');
        throw new ExpressError(msg, 400);
    } else {
        next();
    }
}
