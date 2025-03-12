const mongoose = require('mongoose');

const itemSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  sku: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'category', // ✅ Make sure 'Category' matches the actual model name
    required: true
  },
  unit: {
    type: String,
    required: true,
    trim: true
  },
  quantity: {
    type: Number,
    required: true,
    default: 0,
    min: 0
  },
  minimumLevel: {
    type: Number,
    default: 10,
    min: 0
  },
  reorderLevel: {
    type: Number,
    default: 20,
    min: 0
  },
  department: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Department'
  },
  cost: {
    type: Number,
    default: 0
  },
  location: {
    type: String,
    trim: true
  },
  status: {
    type: String,
    enum: ['available', 'low', 'out_of_stock', 'expired', 'discontinued'],
    default: 'available'
  },
  expiryDate: {
    type: Date
  },
  supplier: {
    name: String,
    contactPerson: String,
    email: String,
    phone: String
  },
  lastUpdated: {
    type: Date,
    default: Date.now
  },
  updatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Update status based on quantity before saving
itemSchema.pre('save', function (next) {
  if (this.quantity <= 0) {
    this.status = 'out_of_stock';
  } else if (this.quantity <= this.minimumLevel) {
    this.status = 'low';
  } else {
    this.status = 'available';
  }

  // Check if item is expired
  if (this.expiryDate && this.expiryDate < new Date()) {
    this.status = 'expired';
  }

  this.lastUpdated = new Date();
  next();
});

const Item = mongoose.model('Item', itemSchema);
module.exports = Item;
