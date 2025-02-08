const router = require("express").Router();
const HomeReview = require("../models/HomeReviewSchema");
const { verifyTokenAndAuthorization, verifyTokenAndAdmin } = require("./verifyToken");


router.post("/home-reviews",verifyTokenAndAdmin, async (req, res) => {
  try {
    const { heading, desc, image, rating,name } = req.body;

    // Create a new HomeReview document
    const newReview = new HomeReview({ heading, desc, image, rating,name });
    await newReview.save();

    res
      .status(201)
      .json({ message: "Home review created successfully.", data: newReview });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ message: "An error occurred.", error: error.message });
  }
});

router.get("/home-reviews", async (req, res) => {
  try {
    const reviews = await HomeReview.find();
    res
      .status(200)
      .json({ message: "Home reviews retrieved successfully.", data: reviews });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ message: "An error occurred.", error: error.message });
  }
});

router.get("/home-reviews/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const review = await HomeReview.findById(id);

    if (!review) {
      return res.status(404).json({ message: "Home review not found." });
    }

    res
      .status(200)
      .json({ message: "Home review retrieved successfully.", data: review });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ message: "An error occurred.", error: error.message });
  }
});

router.put("/home-reviews/:id",verifyTokenAndAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { heading, desc, image, rating,name } = req.body;

    const updatedReview = await HomeReview.findByIdAndUpdate(
      id,
      { heading, desc, image, rating,name },
      { new: true, runValidators: true }
    );

    if (!updatedReview) {
      return res.status(404).json({ message: "Home review not found." });
    }

    res.status(200).json({
      message: "Home review updated successfully.",
      data: updatedReview,
    });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ message: "An error occurred.", error: error.message });
  }
});

router.delete("/home-reviews/:id",verifyTokenAndAdmin, async (req, res) => {
  try {
    const { id } = req.params;

    const deletedReview = await HomeReview.findByIdAndDelete(id);

    if (!deletedReview) {
      return res.status(404).json({ message: "Home review not found." });
    }

    res
      .status(200)
      .json({
        message: "Home review deleted successfully.",
        data: deletedReview,
      });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ message: "An error occurred.", error: error.message });
  }
});

module.exports = router;
