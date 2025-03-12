const express = require('express');
const Item = require('../models/Item');
const Transaction = require('../models/Transaction');
const { auth, managerAuth } = require('../middleware/auth');

const router = express.Router();

// Get transactions by date range
router.get('/transactions', auth, async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    
    const query = {};
    if (startDate && endDate) {
      query.transactionDate = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }
    
    const transactions = await Transaction.find(query)
      .populate('item', 'name sku')
      .populate('requestedBy', 'name')
      .populate('approvedBy', 'name')
      .populate('department', 'name')
      .sort({ transactionDate: -1 });
    
    res.json(transactions);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get low stock items report
router.get('/low-stock', auth, async (req, res) => {
  try {
    const items = await Item.find({
      $or: [
        { status: 'low' },
        { status: 'out_of_stock' }
      ]
    })
      .populate('category', 'name')
      .populate('department', 'name');
    
    res.json(items);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get expiring items report
router.get('/expiring', auth, async (req, res) => {
  try {
    const thirtyDaysFromNow = new Date();
    thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);
    
    const items = await Item.find({
      expiryDate: {
        $exists: true,
        $ne: null,
        $lte: thirtyDaysFromNow
      }
    })
      .populate('category', 'name')
      .populate('department', 'name')
      .sort({ expiryDate: 1 });
    
    res.json(items);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get inventory value report
router.get('/value', auth, managerAuth, async (req, res) => {
  try {
    const items = await Item.find();
    
    // Calculate total inventory value
    const totalValue = items.reduce((sum, item) => sum + (item.quantity * item.cost), 0);
    
    // Calculate value by category
    const categories = {};
    for (const item of items) {
      const categoryId = item.category.toString();
      if (!categories[categoryId]) {
        categories[categoryId] = 0;
      }
      categories[categoryId] += item.quantity * item.cost;
    }
    
    // Calculate value by department
    const departments = {};
    for (const item of items) {
      if (item.department) {
        const departmentId = item.department.toString();
        if (!departments[departmentId]) {
          departments[departmentId] = 0;
        }
        departments[departmentId] += item.quantity * item.cost;
      }
    }
    
    res.json({
      totalValue,
      categories,
      departments
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;