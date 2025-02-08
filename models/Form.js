const mongoose = require('mongoose');

const formSchema = new mongoose.Schema({
  name: { type: String},
  email : { type: String},
  mobile : { type: String},
  message : { type: String}
});

module.exports = mongoose.model('Form', formSchema);