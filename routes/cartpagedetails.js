const CartPage = require('../models/CartPageDetailsSchema');

const router = require("express").Router();

router.post('/',async (req,res) =>{
    console.log(req.body)
    const cart = req.body.cart.products.map((product)=>{
        return {
            productId : product.product._id,
            title : product.product.title,
            quantity : product.amount,
            total : product.amount * product.product.salePrice,
            variant : product && product.selectedVariant ? product.selectedVariant : null
        }
    })
    console.log(cart)
    try {
        const cartDetails = await CartPage.create({
            name : req.body.formData.name,
            phone : req.body.formData.phone,
            cart : cart,
            variant : req.body.variant ? req.body.variant : null
        })
        res.status(200).json({success : "ok"})
    } catch (error) {
        res.status(500).json({message : error.message})
    }
})

router.get('/' , async (req,res) => {
  try {
    const data = await CartPage.find()
    res.status(200).json({message : "ok" , data : data})
  } catch (error) {
    res.status(500).json({message : error.message})
  }
})

module.exports = router