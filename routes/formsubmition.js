const router = require("express").Router();
const Form = require("../models/Form");




router.post("/", async (req, res) => {
    try {
    const form = await Form.create(req.body)

    res.json({data: form,status: 200})
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  })
router.get("/", async (req, res) => {
    try {
    const form = await Form.find()

    res.json({data: form,status: 200})
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
})
router.delete("/:id", async (req, res) => {
    try {
    const form = await Form.findByIdAndDelete(req.params.id)

    res.json({data: form,status: 200})
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
})
  module.exports = router