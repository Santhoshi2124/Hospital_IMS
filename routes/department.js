const express = require('express');
const Department = require('../models/Department');
const { auth, adminAuth } = require('../middleware/auth');

const router = express.Router();

// Get all departments
router.get('/', auth, async (req, res) => {
  try {
    const departments = await Department.find().populate('manager', 'name email');
    res.json(departments);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get single department
router.get('/:id', auth, async (req, res) => {
  try {
    const department = await Department.findById(req.params.id).populate('manager', 'name email');
    if (!department) {
      return res.status(404).json({ message: 'Department not found' });
    }
    res.json(department);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Create new department
router.post('/', auth, adminAuth, async (req, res) => {
  try {
    const { name, location, contact, manager } = req.body;
    
    // Check if department already exists
    let department = await Department.findOne({ name });
    if (department) {
      return res.status(400).json({ message: 'Department already exists' });
    }
    
    department = new Department({
      name,
      location,
      contact,
      manager
    });
    
    await department.save();
    res.status(201).json(department);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update department
router.put('/:id', auth, adminAuth, async (req, res) => {
  try {
    const department = await Department.findById(req.params.id);
    if (!department) {
      return res.status(404).json({ message: 'Department not found' });
    }
    
    const { name, location, contact, manager } = req.body;
    
    // Check if name is being changed and if it already exists
    if (name !== department.name) {
      const existingDepartment = await Department.findOne({ name });
      if (existingDepartment) {
        return res.status(400).json({ message: 'Department name already exists' });
      }
    }
    
    department.name = name || department.name;
    department.location = location || department.location;
    department.contact = contact || department.contact;
    department.manager = manager || department.manager;
    
    await department.save();
    res.json(department);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete department
router.delete('/:id', auth, adminAuth, async (req, res) => {
  try {
    const department = await Department.findById(req.params.id);
    if (!department) {
      return res.status(404).json({ message: 'Department not found' });
    }
    
    await department.remove();
    res.json({ message: 'Department removed' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;