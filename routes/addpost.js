const Post = require("../models/Post");
const express = require("express");
const {
  verifyTokenAndAuthorization,
  verifyTokenAndAdmin,
} = require("./verifyToken");
const CryptoJS = require("crypto-js");
const path = require("path");
const uploadOnCloudinary = require("../utils/cloudinery");
const router = require("express").Router();

const multer = require("multer");

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    return cb(null, "./public"); // Destination directory for uploaded files
  },
  filename: function (req, file, cb) {
    return cb(null, Date.now() + path.extname(file.originalname)); // File naming
  },
});

const upload = multer({ storage: storage });

router.post(
  "/",
  verifyTokenAndAdmin,
  upload.single("images"),
  async (req, res) => {
    const response = await uploadOnCloudinary(req.file.path);

    let newPost;

    newPost = new Post({
      title: req.body.title,
      img: response.secure_url,
      content: req.body.post,
      shortDis: req.body.shortDis,
    });
    try {
      const savedPost = await newPost.save();

      res.status(200).json(savedPost);
    } catch (error) {
      res.status(500).json(error.message);
    }
  }
);

router.put("/:id", verifyTokenAndAdmin, async (req, res) => {
  try {
    const updatedProduct = await Post.findByIdAndUpdate(
      req.params.id,
      {
        $set: req.body,
      },
      { new: true }
    );
    if (updatedUser) {
      res.status(200).json(updatedProduct);
    }
  } catch (error) {
    res.status(500).json(err);
  }
});

router.delete("/:id", verifyTokenAndAdmin, async (req, res) => {
  try {
    await Post.findByIdAndDelete(req.params.id);
    res.status(200).json("Product has been deleted");
  } catch (error) {
    res.status(500).json(error);
  }
});
router.get("/find/:id", async (req, res) => {
  try {
    const product = await Post.findById(req.params.id);
    res.status(200).json(product);
  } catch (err) {
    res.status(500).json(err);
  }
});

router.get("/latest", async (req, res) => {
  try {
    // Fetch the latest 3 posts sorted by creation date in descending order
    const latestPosts = await Post.find().sort({ createdAt: -1 }).limit(3);

    // Respond with the fetched posts
    res.status(200).json({
      success: true,
      data: latestPosts,
    });
  } catch (error) {
    console.error("Error fetching latest posts:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch latest posts",
    });
  }
});

router.get("/posts", async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1; // Default to page 1
    const limit = parseInt(req.query.limit) || 10; // Default to 10 posts per page
    const skip = (page - 1) * limit;

    // Fetch posts with pagination
    const posts = await Post.find()
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 }); // Sort by newest posts first

    // Get total post count for pagination metadata
    const totalPosts = await Post.countDocuments();

    res.status(200).json({
      success: true,
      data: posts,
      pagination: {
        totalPosts,
        currentPage: page,
        totalPages: Math.ceil(totalPosts / limit),
        limit,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch posts",
      error: error.message,
    });
  }
});

module.exports = router;
