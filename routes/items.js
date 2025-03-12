const express = require('express');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Item = require('../models/Item'); // ✅ Make sure Item model is imported
const Transaction = require('../models/Transaction'); // ✅ Ensure Transaction model exists
const { auth, adminAuth, managerAuth } = require('../middleware/auth'); // ✅ Added managerAuth

const router = express.Router();

// Register a new user
router.post('/register', async (req, res) => {
  try {
    const { name, email, password, role, department } = req.body;

    let user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({ message: 'User already exists' });
    }

    user = new User({ name, email, password, role, department });
    await user.save();

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1d' });

    res.status(201).json({ message: 'User registered successfully', token, user });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Login user
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });

    if (!user || !(await user.comparePassword(password))) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1d' });

    res.json({ message: 'Login successful', token, user });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get current user
router.get('/me', auth, async (req, res) => {
  try {
    res.json(req.user);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get all users (admin only)
router.get('/users', auth, adminAuth, async (req, res) => {
  try {
    const users = await User.find().select('-password').populate('department');
    res.json(users);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// ✅ Create new item (Only Managers & Admins)
router.post('/', auth, managerAuth, async (req, res) => {
  try {
    const newItem = new Item({ ...req.body, updatedBy: req.user.id });
    const item = await newItem.save();

    const transaction = new Transaction({
      item: item._id,
      type: 'received',
      quantity: item.quantity,
      previousQuantity: 0,
      newQuantity: item.quantity,
      requestedBy: req.user.id,
      approvedBy: req.user.id,
      department: item.department,
      notes: 'Initial inventory'
    });

    await transaction.save();
    res.status(201).json(item);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// ✅ Update item
router.put('/:id', auth, managerAuth, async (req, res) => {
  try {
    const item = await Item.findById(req.params.id);
    if (!item) return res.status(404).json({ message: 'Item not found' });

    const previousQuantity = item.quantity;
    Object.assign(item, req.body);
    item.updatedBy = req.user.id;
    await item.save();

    if (previousQuantity !== item.quantity) {
      const transaction = new Transaction({
        item: item._id,
        type: previousQuantity < item.quantity ? 'received' : 'issued',
        quantity: Math.abs(item.quantity - previousQuantity),
        previousQuantity,
        newQuantity: item.quantity,
        requestedBy: req.user.id,
        approvedBy: req.user.id,
        department: item.department,
        notes: req.body.notes || 'Inventory update'
      });

      await transaction.save();
    }

    res.json(item);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// ✅ Delete item
router.delete('/:id', auth, managerAuth, async (req, res) => {
  try {
    const item = await Item.findById(req.params.id);
    if (!item) return res.status(404).json({ message: 'Item not found' });

    await item.remove();
    res.json({ message: 'Item removed' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// ✅ Get low stock items
router.get('/status/low', auth, async (req, res) => {
  try {
    const items = await Item.find({ status: 'low' }).populate('category department');
    res.json(items);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// ✅ Get out-of-stock items
router.get('/status/out', auth, async (req, res) => {
  try {
    const items = await Item.find({ status: 'out_of_stock' }).populate('category department');
    res.json(items);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// ✅ Get items by department
router.get('/department/:departmentId', auth, async (req, res) => {
  try {
    const items = await Item.find({ department: req.params.departmentId }).populate('category department');
    res.json(items);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;