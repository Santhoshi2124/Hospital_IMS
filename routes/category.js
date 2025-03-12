const express = require('express');
const Category = require('../models/category');
const { auth, managerAuth } = require('../middleware/auth');

const router = express.Router();

// Get all categories
router.get('/', auth, async (req, res) => {
  try {
    const categories = await Category.find();
    res.json(categories);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get single category
router.get('/:id', auth, async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);
    if (!category) {
      return res.status(404).json({ message: 'Category not found' });
    }
    res.json(category);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Create new category
router.post('/', auth, managerAuth, async (req, res) => {
  try {
    const { name, description } = req.body;
    
    // Check if category already exists
    let category = await Category.findOne({ name });
    if (category) {
      return res.status(400).json({ message: 'Category already exists' });
    }
    
    category = new Category({
      name,
      description
    });
    
    await category.save();
    res.status(201).json(category);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update category
router.put('/:id', auth, managerAuth, async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);
    if (!category) {
      return res.status(404).json({ message: 'Category not found' });
    }
    
    const { name, description } = req.body;
    
    // Check if name is being changed and if it already exists
    if (name !== category.name) {
      const existingCategory = await Category.findOne({ name });
      if (existingCategory) {
        return res.status(400).json({ message: 'Category name already exists' });
      }
    }
    
    category.name = name || category.name;
    category.description = description || category.description;
    
    await category.save();
    res.json(category);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete category
router.delete('/:id', auth, managerAuth, async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);
    if (!category) {
      return res.status(404).json({ message: 'Category not found' });
    }
    
    await category.remove();
    res.json({ message: 'Category removed' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;