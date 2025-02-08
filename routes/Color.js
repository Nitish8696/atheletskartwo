const express = require('express');
const mongoose = require('mongoose');
const Color = require('../models/ColorSchema'); // Adjust the path to your model
const router = express.Router();

// Create a new color
router.post('/colors', async (req, res) => {
  try {
    const { name, hashValue } = req.body;
    const color = new Color({ name, hashValue });
    await color.save();
    res.status(201).json({ message: 'Color created successfully', color });
  } catch (error) {
    res.status(400).json({ message: 'Error creating color', error });
  }
});

// Get all colors
router.get('/colors', async (req, res) => {
  try {
    const colors = await Color.find();
    res.status(200).json(colors);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching colors', error });
  }
});

// Get a single color by ID
router.get('/colors/:id', async (req, res) => {
  try {
    const color = await Color.findById(req.params.id);
    if (!color) {
      return res.status(404).json({ message: 'Color not found' });
    }
    res.status(200).json(color);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching color', error });
  }
});

// Update a color by ID
router.put('/colors/:id', async (req, res) => {
  try {
    const { name, hashValue } = req.body;
    const color = await Color.findByIdAndUpdate(
      req.params.id,
      { name, hashValue },
      { new: true, runValidators: true }
    );
    if (!color) {
      return res.status(404).json({ message: 'Color not found' });
    }
    res.status(200).json({ message: 'Color updated successfully', color });
  } catch (error) {
    res.status(400).json({ message: 'Error updating color', error });
  }
});

// Delete a color by ID
router.delete('/colors/:id', async (req, res) => {
  try {
    const color = await Color.findByIdAndDelete(req.params.id);
    if (!color) {
      return res.status(404).json({ message: 'Color not found' });
    }
    res.status(200).json({ message: 'Color deleted successfully', color });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting color', error });
  }
});

module.exports = router;
