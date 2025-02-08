const mongoose = require("mongoose");

const newArrivalSchema = new mongoose.Schema({
  id: { type: String, required: true },
});

module.exports = mongoose.model("NewArrival", newArrivalSchema);
