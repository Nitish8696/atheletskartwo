const router = require("express").Router();
const uuid = require("uuid");

var https = require("follow-redirects").https;
var fs = require("fs");

const express = require("express");
const Order = require("../models/Order");
const Cart = require("../models/Cart");
const axios = require("axios");
const crypto = require("crypto");
const cron = require("node-cron");
const Product = require("../models/Product");

router.use(express.urlencoded({ extended: true }));

router.get("/payment/:id", async (req, res) => {
  const { cartId } = req.cookies;
  const order = await Order.findById(req.params.id);
  const data = {
    merchantId: "M22HN3XFPQ7WE",
    merchantTransactionId: order.transationId,
    merchantUserId: "MUID123",
    amount: order.codFee * 100,
    redirectUrl: `https://athleteskart.in/success/PAYMENT_SUCCESS/Cod/${order.transationId}`,
    redirectMode: "REDIRECT",
    callbackUrl: `http://dogbackend.drsmithflexibles.com/api/cod/status/${order.transationId}/${req.cookies.cartId}`,
    mobileNumber: "9999999999",
    paymentInstrument: {
      type: "PAY_PAGE",
    },
  };
  const payload = JSON.stringify(data);
  const payloadMain = Buffer.from(payload).toString("base64");
  const key = "ad08a894-d6e0-4fbb-a949-bdb5fe340a06";
  const keyIndex = 1;
  const string = payloadMain + "/pg/v1/pay" + key;
  const sha256 = crypto.createHash("sha256").update(string).digest("hex");
  const checksum = sha256 + "###" + keyIndex;

  const URL = "https://api.phonepe.com/apis/hermes/pg/v1/pay";

  const options = {
    method: "post",
    url: URL,
    headers: {
      accept: "application/json",
      "Content-Type": "application/json",
      "X-VERIFY": checksum,
    },
    data: {
      request: payloadMain,
    },
  };
  axios
    .request(options)
    .then(function (response) {
      return res
        .status(200)
        .send(response.data.data.instrumentResponse.redirectInfo.url);
    })
    .catch(function (error) {
      console.error(error);
    });
//   try {
//     const cod = await Order.findOneAndUpdate(
//       { _id: req.params.id },
//       { $set: { status: "COD" } },
//       { new: true }
//     );
//     const removeCart = await Cart.findOneAndDelete({ cartId: cartId });
//     res.json({ cod: cod, status: 200 });
//   } catch (error) {
//     res.json({ error: error.message, status: 500 });
//   }
});

async function updateProductStock(transactionId) {
  try {
    // Find the order by transactionId
    const order = await Order.findOne({
      transationId: transactionId,
      isQuantityRemoved: false,
    });

    if (!order) {
      console.log("Order not found or stock already updated.");
      return;
    }

    // Iterate through the products in the order
    for (const orderedProduct of order.products) {
      const product = await Product.findById(orderedProduct.productId);

      if (!product) {
        console.log(`Product with ID ${orderedProduct.productId} not found.`);
        continue;
      }

      if (orderedProduct.variable) {
        // If variable is not null, find the matching variation
        const variation = product.variations.find((v) =>
          Object.entries(orderedProduct.variable).every(
            ([key, value]) => v.attributeCombination.get(key) === value
          )
        );

        if (variation) {
          // Reduce the stock of the variation
          if (variation.stock >= orderedProduct.quantity) {
            variation.stock -= orderedProduct.quantity;
          } else {
            console.log(
              `Insufficient stock for variation in product ${product._id}.`
            );
            continue;
          }
        } else {
          console.log(
            `No matching variation found for product ${product._id}.`
          );
          continue;
        }
      } else {
        // If variable is null, reduce the main product stock
        if (product.inStock >= orderedProduct.quantity) {
          product.inStock -= orderedProduct.quantity;
        } else {
          console.log(`Insufficient stock for product ${product._id}.`);
          continue;
        }
      }

      // Save the updated product
      await product.save();
    }

    // Update the order's isQuantityRemoved flag
    order.isQuantityRemoved = true;
    await order.save();

    console.log("Stock updated successfully.");
  } catch (error) {
    console.error("Error updating stock:", error);
  }
}

router.post("/status/:txnId/:cartId?", async (req, res) => {
    const merchantId = "M22HN3XFPQ7WE";
    const SALT_KEY = "ad08a894-d6e0-4fbb-a949-bdb5fe340a06";
    const keyIndex = 1;
    const string = `/pg/v1/status/${merchantId}/${req.params.txnId}` + SALT_KEY;
    const sha256 = crypto.createHash("sha256").update(string).digest("hex");
    const checksum = sha256 + "###" + keyIndex;
    const options = {
      method: "get",
      url: `https://api.phonepe.com/apis/hermes/pg/v1/status/${merchantId}/${req.params.txnId}`,
      headers: {
        accept: "application/json",
        "Content-Type": "application/json",
        "X-VERIFY": checksum,
        "X-MERCHANT-ID": `${merchantId}`,
      },
    };
    try {
      const response = await axios.request(options);
  
      if (response.data.code === "PAYMENT_SUCCESS") {
        const removeCart = await Cart.findOneAndDelete({
          cartId: req.cookies.cartId,
        });
        const order = await Order.updateOne(
          { transationId: response.data.data.merchantTransactionId },
          { $set: { status: "COD" } }
        );
        updateProductStock(req.params.txnId);
        res.status(200).json({message: 'Success'});
      } else if (response.data.code === "PAYMENT_ERROR") {
        await Order.updateOne(
          { transationId: response.data.data.merchantTransactionId },
          { $set: { status: "PAYMENT_ERROR" } }
        );
        res.status(200).json({message: 'Error'});
      } else if (response.data.code === "PAYMENT_PENDING") {
        await Order.updateOne(
          { transationId: response.data.data.merchantTransactionId },
          { $set: { status: "PAYMENT_PENDING" } }
        );
        res.status(200).json({message: 'Pending'});
      } else if (response.data.code === "INTERNAL_SERVER_ERROR") {
        await Order.updateOne(
          { transationId: response.data.data.merchantTransactionId },
          { $set: { status: "INTERNAL_SERVER_ERROR" } }
        );
        res.status(200).json({message: 'Internal'});
      } else {
        await Order.updateOne(
          { transationId: response.data.data.merchantTransactionId },
          { $set: { status: "PAYMENT_ERROR" } }
        );
        res.status(200).json({message: 'Error'});
      }
    } catch (error) {
      console.error(error);
      res.status(500).send("An error occurred");
    }
  });



module.exports = router;
