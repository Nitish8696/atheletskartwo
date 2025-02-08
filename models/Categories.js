const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema({
  name: { type: String, required: true },
  slug: { type: String, required: true },
  parentCategory: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', default : null},
  level : {type : Number, required : true},
  img : {type : String, required : true }
});

module.exports = mongoose.model('Category', categorySchema);