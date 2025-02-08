const Order = require("../models/Order");
const {
  verifyToken,
  verifyTokenAndAuthorization,
  verifyTokenAndAdmin,
} = require("./verifyToken");
const CryptoJS = require("crypto-js");

const router = require("express").Router();

router.post("/", verifyToken, async (req, res) => {
  const newOrder = new Order({
    userId: req.user.id,
    products: req.body.products,
    amount: req.body.amount,
    address: req.body.address,
    transationId: req.body.transationId,
    codFee : req.body.codFee
  });

  try {
    const savedOrder = await newOrder.save();
    res.status(200).json(savedOrder);
  } catch (error) {
    res.status(500).json(error);
  }
});

router.get("/order-status/:transactionId", async (req, res) => {
  const { transactionId } = req.params;

  try {
    // Find the order by transactionId
    const order = await Order.findOne({ transationId: transactionId });

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    // Respond with the status
    res.status(200).json({ status: order.status });
  } catch (error) {
    console.error("Error fetching order status:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

router.put("/:id", verifyTokenAndAdmin, async (req, res) => {
  try {
    const updatedOrder = await Order.findByIdAndUpdate(
      req.params.id,
      {
        $set: req.body,
      },
      { new: true }
    );
    if (updatedOrder) {
      res.status(200).json(updatedOrder);
    }
  } catch (error) {
    res.status(500).json(err);
  }
});

router.delete("/:id", verifyTokenAndAdmin, async (req, res) => {
  try {
    await Order.findByIdAndDelete(req.params.id);
    res.status(200).json("Order has been deleted");
  } catch (error) {
    res.status(500).json(error);
  }
});

router.get("/find/:userId", verifyToken, async (req, res) => {
  try {
    const orders = await Order.find({ userId: req.params.userId });
    console.log(orders);
    res.status(200).json(orders);
  } catch (err) {
    res.status(500).json(err);
  }
});

router.get("/", verifyTokenAndAdmin, async (req, res) => {
  const { page = 1, limit = 10 } = req.query; // Default to page 1, limit 10
  try {
    // Filter orders based on the specified status
    const filter = { status: { $in: ["PAYMENT_SUCCESS", "COD"] } };

    const orders = await Order.find(filter)
      .sort({ createdAt: -1 }) // Sort by newest
      .skip((page - 1) * limit) // Skip records based on page
      .limit(Number(limit)); // Limit the number of records

    const totalOrders = await Order.countDocuments(filter);

    res.json({
      orders,
      totalPages: Math.ceil(totalOrders / limit),
      currentPage: Number(page),
    });
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch orders" });
  }
});


router.get("/income", verifyTokenAndAdmin, async (req, res) => {
  const date = new Date();
  const lastMonth = new Date(date.setMonth(date.getMonth() - 1));
  const previousMonth = new Date(new Date().setMonth(lastMonth.getMonth() - 1));

  try {
    const income = await Order.aggregate([
      { $match: { createdAt: { $gte: previousMonth } } },
      {
        $project: {
          month: { $month: "$createdAt" },
          sales: "$amount",
        },
      },
      {
        $group: {
          _id: "$month",
          total: { $sum: "$sales" },
        },
      },
    ]);
    res.status(200).json(income);
  } catch (error) {
    res.status(500).json(error);
  }
});

module.exports = router;
