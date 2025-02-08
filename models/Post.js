const mongoose = require("mongoose");
const postSchema = new mongoose.Schema(
  {
    content: {
      type: String,
      required: true,
    },
    shortDis: {
      type: String,
      required: true,
    },
    title: {
      type: String,
      required: true,
    },
    img: { type: Array, required: true },
  },
  { timestamps: true }
);


module.exports = mongoose.model("Post", postSchema)
