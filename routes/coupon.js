const Coupon = require("../models/Coupon")
const { verifyTokenAndAuthorization, verifyTokenAndAdmin,verifyToken } = require("./verifyToken");
const router = require("express").Router();


// Create a new coupon
router.post('/create',async (req, res) => {
    console.log("hello")
    const { couponTitle, percentage, minQuantity, expirationDate } = req.body;
  
    try {
      // Create and save the coupon
      const newCoupon = new Coupon({
        couponTitle,
        percentage,
        minQuantity,
        expirationDate,
      });
  
      await newCoupon.save();
      res.status(201).json({ message: 'Coupon created successfully', coupon: newCoupon });
    } catch (error) {
      res.status(500).json({ error: 'Failed to create coupon' });
    }
  });

// Get a coupon by code
router.get('/', async (req, res) => {
    try {
      const coupons = await Coupon.find();
      res.status(200).json(coupons);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch coupons' });
    }
  });

// get a coupon by specific id
router.get('/:id', async (req, res) => {
    const { id } = req.params;
  
    try {
      const coupon = await Coupon.findById(id);
  
      if (!coupon) {
        return res.status(404).json({ error: 'Coupon not found' });
      }
  
      res.status(200).json(coupon);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch coupon' });
    }
  });

// Update a coupon
router.put('/:id',verifyTokenAndAdmin, async (req, res) => {
    const { id } = req.params;
    const { couponTitle, percentage, minQuantity, expirationDate } = req.body;
  
    try {
      const updatedCoupon = await Coupon.findByIdAndUpdate(
        id,
        { couponTitle, percentage, minQuantity, expirationDate },
        { new: true, runValidators: true }
      );
  
      if (!updatedCoupon) {
        return res.status(404).json({ error: 'Coupon not found' });
      }
  
      res.status(200).json({ message: 'Coupon updated successfully', coupon: updatedCoupon });
    } catch (error) {
      res.status(500).json({ error: 'Failed to update coupon' });
    }
  });

// Delete a coupon
router.delete('/:id',verifyTokenAndAdmin, async (req, res) => {
    const { id } = req.params;
  
    try {
      const deletedCoupon = await Coupon.findByIdAndDelete(id);
  
      if (!deletedCoupon) {
        return res.status(404).json({ error: 'Coupon not found' });
      }
  
      res.status(200).json({ message: 'Coupon deleted successfully' });
    } catch (error) {
      res.status(500).json({ error: 'Failed to delete coupon' });
    }
  });

module.exports = router;
