const mongoose = require("mongoose");

const buttonLinkSchema = new mongoose.Schema(
  {
    link: { type: String, required: true },
  }
);

module.exports = mongoose.model("Button", buttonLinkSchema);