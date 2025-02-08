const router = require("express").Router();
const NewArrival = require("../models/NewArrival");
const {
  verifyTokenAndAuthorization,
  verifyTokenAndAdmin,
} = require("./verifyToken");

router.post("/new-arrival", verifyTokenAndAdmin, async (req, res) => {
  try {
    const { id } = req.body;

    if (!id) {
      return res.status(400).json({ message: "'id' field is required." });
    }

    // Check if a NewArrival document already exists
    const existingDocument = await NewArrival.findOne();

    if (existingDocument) {
      // Update the existing document
      existingDocument.id = id;
      await existingDocument.save();
      return res.status(200).json({
        message: "Document updated successfully.",
        data: existingDocument,
      });
    }

    // Create a new document if none exists
    const newDocument = new NewArrival({ id });
    await newDocument.save();
    return res
      .status(201)
      .json({ message: "Document created successfully.", data: newDocument });
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ message: "An error occurred.", error: error.message });
  }
});
router.get("/new-arrival", async (req, res) => {
  try {
    const document = await NewArrival.findOne();

    if (!document) {
      return res.status(404).json({ message: "No document found." });
    }

    return res
      .status(200)
      .json({ message: "Document retrieved successfully.", data: document });
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ message: "An error occurred.", error: error.message });
  }
});
module.exports = router;
