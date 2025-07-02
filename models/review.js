const mongoose = require("mongoose");
const { listingSchema } = require("../utils/joiValidatoin");
const Schema = mongoose.Schema;


const reviewSchema = new Schema(
    {
        comment: {
            type: String,
        },
        rating: {
            type: Number,
            min: 1,
            max: 5,
        },
        createdAt: {
            type: Date,
        },
        author:{
            type: Schema.Types.ObjectId,
            ref: "User",
        }

    }
);



const Review = mongoose.model("Review", reviewSchema);
module.exports = Review;
// Compare this snippet from models/listing.js: