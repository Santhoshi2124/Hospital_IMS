const mongoose = require('mongoose');

const departmentSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
    unique: true
  },
  location: {
    floor: String,
    wing: String,
    roomNumber: String
  },
  contact: {
    phone: String,
    email: String,
    extensionNumber: String
  },
  manager: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const Department = mongoose.model('Department', departmentSchema);
module.exports = Department;
