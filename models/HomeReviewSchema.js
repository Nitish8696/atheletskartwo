const mongoose = require("mongoose");

const homeReviewSchema = new mongoose.Schema({
  heading: { type: String },
  desc: { type: String },
  image: { type: String },
  rating: { type: String },
  name : {type : String },
});

module.exports = mongoose.model("HomeReview", homeReviewSchema);
