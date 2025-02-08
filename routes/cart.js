const Cart = require("../models/Cart");
const uuid = require("uuid");
const {
  verifyToken,
  verifyTokenAndAuthorization,
  verifyTokenAndAdmin,
} = require("./verifyToken");
const CryptoJS = require("crypto-js");

const router = require("express").Router();

const cartmiddleware = async (req, res, next) => {
  console.log(req.cookies.cartId)
  if (!req.cookies.cartId) {
    const cartId = uuid.v4();
    req.cartId = cartId;
    res.cookie("cartId", req.cartId);
    next();
  } else {
    req.cartId = req.cookies.cartId;
    next();
  }
};

router.get("/", cartmiddleware, async (req, res) => {
  try {
    const  cartId  = req.cartId; 

    const cart = await Cart.findOne({ cartId });

    if (!cart) {
      return res.status(404).json({ message: "Nothing is in your cart" });
    }
    res.status(200).json(cart);
  } catch (error) {
    console.error("Error retrieving cart:", error);
    res.status(500).json({ message: "Internal server error", error });
  }
});

router.post("/", cartmiddleware, async (req, res) => {
  console.log("hello");
  console.log(req.body.cart);
  try {
    const updatedCart = await Cart.findOneAndUpdate(
      { cartId: req.cartId },
      {
        cartId: req.cartId,
        cart: req.body.cart,
        expiresAt: Date(Date.now() + 2 * 60 * 1000),
      },
      {
        new: true, // Return the updated document
        upsert: true, // Create a new document if no document matches the query
        runValidators: true, // Ensure the document passes schema validation
      }
    );
    if (updatedCart) {
      res.status(200).json(updatedCart);
    }
  } catch (error) {
    res.status(500).json(error);
  }
});

router.delete("/:id", verifyTokenAndAuthorization, async (req, res) => {
  try {
    await Cart.findByIdAndDelete(req.params.id);
    res.status(200).json("Cart has been deleted");
  } catch (error) {
    res.status(500).json(error);
  }
});

router.get("/find/:userId", verifyTokenAndAuthorization, async (req, res) => {
  try {
    const cart = await Cart.findOne({ userId: req.params.userId });
    res.status(200).json(cart);
  } catch (err) {
    res.status(500).json(err);
  }
});

router.get("/", verifyTokenAndAdmin, async (req, res) => {
  try {
    const carts = await Cart.find();
    res.status(200).json(carts);
  } catch (error) {
    res.status(500).json(err);
  }
});

module.exports = router;
