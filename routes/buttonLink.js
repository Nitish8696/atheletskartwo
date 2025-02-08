const {
  verifyTokenAndAuthorization,
  verifyTokenAndAdmin,
} = require("./verifyToken");
const router = require("express").Router();
const Button = require("../models/ButtonLinkSchema")

router.post("/button-link", verifyTokenAndAdmin, async (req, res) => {
  const { link } = req.body;

  try {
    // Check if a document already exists
    const existingButtonLink = await Button.findOne();

    if (existingButtonLink) {
      // Update the existing document
      existingButtonLink.link = link;
      await existingButtonLink.save();
      return res.status(200).json({
        message: "Button link updated successfully.",
        link: existingButtonLink.link,
      });
    }

    // Create a new document if none exists
    const newButtonLink = new Button({ link });
    await newButtonLink.save();

    res.status(201).json({
      message: "Button link created successfully.",
      link: newButtonLink.link,
    });
  } catch (error) {
    res.status(500).json({ message: "Error saving the button link.", error });
  }
});

router.get("/button-link", async (req, res) => {
  try {
    const buttonLink = await Button.findOne();

    if (!buttonLink) {
      return res.status(404).json({ message: "No button link found." });
    }
    res.status(200).json({ link: buttonLink.link });
  } catch (error) {
    res.status(500).json({ message: "Error fetching the button link.", error });
  }
});

module.exports = router;
