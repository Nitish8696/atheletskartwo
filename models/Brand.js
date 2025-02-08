const mongoose = require('mongoose');

const brandSchema = new mongoose.Schema({
  name: { type: String, required: true },
  // top : { type: Boolean, default:false },
  // image : { type: String, required: true}
});

module.exports = mongoose.model('BrandCategory', brandSchema);