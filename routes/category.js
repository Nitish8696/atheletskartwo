const Category = require("../models/Categories");
const {
  verifyTokenAndAuthorization,
  verifyTokenAndAdmin,
} = require("./verifyToken");
const router = require("express").Router();
const path = require("path");
const uploadOnCloudinary = require("../utils/cloudinery");
const mongoose = require("mongoose");

const multer = require("multer");

// Set storage engine
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    return cb(null, "./public"); // Destination directory for uploaded files
  },
  filename: function (req, file, cb) {
    return cb(null, Date.now() + path.extname(file.originalname)); // File naming
  },
});

const upload = multer({ storage: storage });

async function getCategoryHierarchy(parentCategory = null) {
  try {
    // Ensure parentCategory is either null or a valid ObjectId
    const query = parentCategory
      ? { parentCategory: new mongoose.Types.ObjectId(parentCategory) }
      : { parentCategory: null };

    // Find categories with the given parentCategory
    const categories = await Category.find(query);

    // For each category, recursively find subcategories
    const categoryHierarchy = await Promise.all(
      categories.map(async (category) => {
        // Check that the category._id is indeed an ObjectId
        if (!mongoose.Types.ObjectId.isValid(category._id)) {
          throw new Error(`Invalid ObjectId: ${category._id}`);
        }
        
        // Recursive call to get subcategories
        const subcategories = await getCategoryHierarchy(category._id);
        return {
          ...category._doc, // Spread category data
          subcategories,    // Nested subcategories
        };
      })
    );

    return categoryHierarchy;
  } catch (error) {
    console.error('Error in getCategoryHierarchy:', error.message);
    throw error; // Rethrow error to be caught in the API route
  }
}

router.get("/categories", async (req, res) => {
  try {
    // Get top-level categories and their subcategories
    const categories = await getCategoryHierarchy();
    res.json(categories);
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ error: "An error occurred while fetching categories." });
  }
});

router.post("/", upload.single("images"), async (req, res) => {
  let category;
  const response = await uploadOnCloudinary(req.file.path);
  if (req.body.parentCategory === "null") {
    category = new Category({
      name: req.body.name,
      slug: req.body.slug,
      level: req.body.level,
      img: response.secure_url,
    });
  } else {
    category = new Category({
      name: req.body.name,
      slug: req.body.slug,
      parentCategory: req.body.parentCategory,
      level: req.body.level,
      img: response.secure_url,
    });
  }
  try {
    const addcategory = await category.save();
    res.status(201).json(addcategory);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Edit category by ID
router.put("/:id", upload.single("images"), async (req, res) => {
  try {
    // Find the category by ID
    let category = await Category.findById(req.params.id);
    if (!category) {
      return res.status(404).json({ message: "Category not found" });
    }

    // Update the category's properties
    category.name = req.body.name || category.name;
    category.slug = req.body.slug || category.slug;
    category.level = req.body.level || category.level;

    // If parentCategory is provided, update it
    if (req.body.parentCategory !== "null" && req.body.parentCategory !== "") {
      category.parentCategory = req.body.parentCategory;
    } else {
      category.parentCategory = null; // Reset to null if empty or 'null'
    }

    // Update the image if a new one is uploaded
    if (req.file) {
      const response = await uploadOnCloudinary(req.file.path);
      category.img = response.secure_url;
    }

    // Save the updated category
    const updatedCategory = await category.save();
    res.status(200).json(updatedCategory);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

router.get("/", async (req, res) => {
  try {
    const categories = await Category.find();
    res.status(200).json(categories);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});
router.get("/:id", async (req, res) => {
  try {
    const categorie = await Category.findById(req.params.id);
    res.status(200).json(categorie);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.delete("/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const updatedCategory = await Category.deleteMany({
      $or: [{ _id: id }, { parentCategory: id }],
    });
    if (updatedCategory) {
      res.json({ status: 200, msg: "Category deleted successfully" });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});



module.exports = router;
