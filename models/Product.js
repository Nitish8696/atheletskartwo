const mongoose = require("mongoose");

const VariationSchema = new mongoose.Schema(
  {
    attributeCombination: {
      type: Map, // Dynamic key-value pairs for attributes
      of: String, // Values for the attributes (e.g., "red", "small", etc.)
    },
    price: { type: Number, required: true },
    regularPrice: { type: Number, required: true },
    stock: { type: Number, required: true },
    image: { type: String, default: "" },
  },
  { _id: false }
);

const ProductSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    features: { type: String, default: null },
    keySpecifications: { type: String, default: null },
    packaging: { type: String, default: null },
    preOrder: { type: Boolean, default: false },
    directionToUse: { type: String, default: null },
    AdditionalInfo: { type: String, default: null },
    shippingRate: { type: String, default: null },
    shippingEndividualRate: { type: String, default: null },
    desc: { type: String, required: true },
    img: { type: [String], required: true },
    color: [{ type: mongoose.Schema.Types.ObjectId, ref: "Color" }],
    male: {
      type: String,
      enum: [
        "MALE",
        "FEMALE",
        "UNISEX",
      ],
      default: "MALE",
    },
    categories: [{ type: mongoose.Schema.Types.ObjectId, ref: "Category" }],
    salePrice: { type: Number, default: null },
    regularPrice: { type: Number, default: null },
    size: { type: String, default: null },
    brand: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "BrandCategory",
      default: null,
    },
    isVariable: { type: Boolean, default: false },
    attributes: {
      type: [
        {
          name: { type: String, required: true }, // Attribute name like color, size, etc.
          values: [
            {
              value: { type: String, required: true }, // Possible value like red, green, etc.
              images: { type: [String], default: [] }, // Associated images for this value
            },
          ], // Possible values like red, green, etc.
        },
      ],
      default: null, // Set attributes to null by default
    },
    variations: {
      type: [VariationSchema], // Array of variations
      default: null, // Set variations to null by default
    },
    inStock: { type: Number },
    video: { type: String, default: null },
    codFee: { type: Number },
  },
  { timestamps: true }
);

ProductSchema.index({ categories: 1, brand: 1, salePrice: 1 });
ProductSchema.index({ color: 1 });

module.exports = mongoose.model("Product", ProductSchema);
