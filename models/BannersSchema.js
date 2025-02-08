const mongoose = require('mongoose');

const bannersSchema = new mongoose.Schema({
  image: { type: String, required: true },
  link : { type: String, required: true}
});

module.exports = mongoose.model('Banners', bannersSchema);