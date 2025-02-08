const mongoose = require('mongoose');

const CartPageSchema = new mongoose.Schema(
    {
        name : {type : String},
        phone : {type : Number},
        cart : [
            {
                productId : {type : String},
                title : {type : String},
                quantity : {type : Number},
                total : {type : Number},
                variant : {type : String}
            }
        ]
    },
    { timestamps: true }
)

module.exports = mongoose.model("CartPage", CartPageSchema)