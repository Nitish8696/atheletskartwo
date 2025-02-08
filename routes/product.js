const Product = require("../models/Product");
const express = require("express");
const { verifyToken, verifyTokenAndAdmin } = require("./verifyToken");
const CryptoJS = require("crypto-js");
const path = require("path");
const router = require("express").Router();
const uploadOnCloudinary = require("../utils/cloudinery");

const multer = require("multer");

// Set storage engine
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    return cb(null, "./public"); // Destination directory for uploaded files
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    cb(null, `${uniqueSuffix}${path.extname(file.originalname)}`);
  },
});

const upload = multer({ storage: storage });

router.get("/products", async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
    } = req.query;

    let orConditions = {};

    // Add the search condition if it exists
    if (req.query.search) {
      orConditions["title"] = { $regex: req.query.search, $options: "i" };
    }

    if (req.query.categories) {
      orConditions["categories"] = {
        $in: [req.query.categories],
      }
    }
    // Add the price range condition if both minPrice and maxPrice are present
    if (req.query.minPrice >= 0 && req.query.maxPrice) {
      orConditions["salePrice"] = {
        $gte: Number(req.query.minPrice),
        $lte: Number(req.query.maxPrice),
      };
    }
    if (req.query.male !== "null") {
      orConditions["male"] = req.query.male;
    }
    // Add the brand condition if it exists
    if (req.query.brand !== "null") {
      orConditions["brand"] = req.query.brand;
    }
    // Add the color condition if it exists
    if (req.query.color !== "null") {
      orConditions["color"] = {
        $in: [req.query.color],
      };
    }

    // Pagination
    const skip = (Number(page) - 1) * Number(limit);

    console.log(orConditions)


    // Fetch products with filters
    const products = await Product.find(orConditions)
      // .skip(skip)
      // .limit(Number(limit))
      .populate("categories") // Populate category for additional details
      .populate("brand") // Populate brand for additional details
      .sort({ createdAt: -1 }); // Sort by creation date, newest first

    // console.log(products);

    // Get total count for pagination
    const totalCount = products.length;

    res.status(200).json({
      success: true,
      data: products,
      pagination: {
        total: totalCount,
        page: Number(page),
        limit: Number(limit),
      },
    });
  } catch (error) {
    console.error("Error fetching products:", error);
    res.status(500).json({ success: false, message: error.message });
  }
});

router.post("/", upload.array("images"), async (req, res) => {
  console.log(req.files);
  let images = [];

  // Map through files and upload each one to Cloudinary
  const uploadPromises = req.files.map(async (file) => {
    const response = await uploadOnCloudinary(file.path);
    return response.secure_url;
  });

  // Wait for all uploads to complete
  images = await Promise.all(uploadPromises);

  const formData = req.body;
  // Convert to a standard JavaScript object if needed
  const standardObject = { ...formData };
  const categoryArray = JSON.parse(standardObject.category);
  const attributes = JSON.parse(standardObject.attributes);
  const variations = JSON.parse(standardObject.variations);
  const color = JSON.parse(standardObject.color || "[]");

  const isVariable = JSON.parse(standardObject.isVariable);

  const stock = Number(standardObject.stock);

  const salePrice = Number(standardObject.salePrice);
  const regularPrice = Number(standardObject.regularPrice);

  let newProduct;

  if (isVariable) {
    newProduct = new Product({
      title: standardObject.title,
      desc: standardObject.description,
      features: standardObject.features || null,
      shippingRate: standardObject.shippingRate || null,
      color: color,
      preOrder: standardObject.preOrder,
      codFee : standardObject.codFee,
      size : standardObject.size || null,
      male: standardObject.male,
      shippingEndividualRate: standardObject.shippingEndividualRate || null,
      keySpecifications: standardObject.keySpecifications || null,
      packaging: standardObject.packaging || null,
      directionToUse: standardObject.directionToUse || null,
      AdditionalInfo: standardObject.additionalInfo || null,
      img: images,
      categories: categoryArray,
      inStock: stock,
      isVariable: isVariable,
      brand: standardObject.brand,
      attributes: attributes,
      variations: variations,
      video: standardObject.video,
      salePrice: salePrice,
      regularPrice: regularPrice,
    });
  } else {
    newProduct = new Product({
      title: standardObject.title,
      desc: standardObject.description,
      img: images,
      color: color,
      preOrder: standardObject.preOrder,
      codFee : standardObject.codFee,
      size : standardObject.size || null,
      male: standardObject.male,
      features: standardObject.features || null,
      shippingRate: standardObject.shippingRate || null,
      shippingEndividualRate: standardObject.shippingEndividualRate || null,
      keySpecifications: standardObject.keySpecifications || null,
      packaging: standardObject.packaging || null,
      directionToUse: standardObject.directionToUse || null,
      AdditionalInfo: standardObject.additionalInfo || null,
      categories: categoryArray,
      inStock: stock,
      isVariable: isVariable,
      brand: standardObject.brand,
      video: standardObject.video,
      salePrice: salePrice,
      regularPrice: regularPrice,
    });
  }
  try {
    const savedProduct = await newProduct.save();
    res.status(200).json(savedProduct);
  } catch (error) {
    res.status(500).json(error.message);
  }
});

router.put("/:id", upload.none(), async (req, res) => {
  const formData = req.body;

  // Convert form data to a standard object if needed
  const standardObject = { ...formData };

  const categoryArray = JSON.parse(standardObject.category || "[]");
  const attributes = JSON.parse(standardObject.attributes || "[]");
  const variations = JSON.parse(standardObject.variations || "[]");
  const images = JSON.parse(standardObject.images || "[]");
  const color = JSON.parse(standardObject.color || "[]");

  const isVariable = JSON.parse(standardObject.isVariable || "false");
  const stock = Number(standardObject.stock || 0);
  const salePrice = Number(standardObject.salePrice || 0);
  const regularPrice = Number(standardObject.regularPrice || 0);

  let updatedProduct = {
    title: standardObject.title,
    desc: standardObject.description,
    features: standardObject.features || null,
    color: color,
    preOrder: standardObject.preOrder,
    codFee : standardObject.codFee,
    male: standardObject.male,
    size : standardObject.size || null,
    keySpecifications: standardObject.keySpecifications || null,
    shippingRate: standardObject.shippingRate || null,
    shippingEndividualRate: standardObject.shippingEndividualRate || null,
    packaging: standardObject.packaging || null,
    shippingRate: standardObject.shippingRate || null,
    directionToUse: standardObject.directionToUse || null,
    AdditionalInfo: standardObject.additionalInfo || null,
    img: images,
    categories: categoryArray,
    inStock: stock,
    isVariable: isVariable,
    brand: standardObject.brand,
    video: standardObject.video,
    salePrice: salePrice,
    regularPrice: regularPrice,
  };

  // If the product is variable, update attributes and variations
  if (isVariable) {
    updatedProduct.attributes = attributes;
    updatedProduct.variations = variations;
  }

  try {
    const product = await Product.findByIdAndUpdate(
      req.params.id,
      {
        $set: updatedProduct,
      },
      { new: true }
    );

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    res.status(200).json(product);
  } catch (error) {
    res.status(500).json(error);
  }
});

router.delete("/:id", async (req, res) => {
  try {
    await Product.findByIdAndDelete(req.params.id);
    res.status(200).json("Product has been deleted");
  } catch (error) {
    res.status(500).json(error);
  }
});
router.get("/find/:id", async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    res.status(200).json(product);
  } catch (err) {
    res.status(500).json(err);
  }
});

router.get("/", async (req, res) => {
  const qCategory = req.query.category;
  const qBrand = req.query.brand;
  const qSearch = req.query.search; // To handle search queries
  const page = Number(req.query.page) || 1;
  const limit = Number(req.query.limit) || 10;
  const skip = (page - 1) * limit;

  try {
    let query = {};

    if (qCategory) {
      query.categories = { $in: [qCategory] };
    }

    if (qBrand) {
      query.brand = { $in: [qBrand] };
    }

    if (qSearch) {
      query.name = { $regex: qSearch, $options: "i" }; // Assuming your products have a 'name' field
    }

    const products = await Product.find(query)
      .sort({ createdAt: -1 }) // Sort by creation date
      .skip(skip)
      .limit(limit);

    const totalProducts = await Product.countDocuments(query); // Count total documents matching the query

    res.status(200).json({
      products,
      totalProducts,
      currentPage: page,
      totalPages: Math.ceil(totalProducts / limit),
    });
  } catch (error) {
    res.status(500).json({ message: "Error fetching products", error });
  }
});


module.exports = router;
