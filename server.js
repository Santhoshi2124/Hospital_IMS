const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const morgan = require('morgan');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;
const mongoUri = process.env.MONGO_URI;

// Middleware
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

// ✅ Ensure Paths Are Correct Before Importing
const authRoutes = require('./routes/auth.js'); 
const itemRoutes = require('./routes/items.js'); 
const categoryRoutes = require('./routes/category.js'); 
const departmentRoutes = require('./routes/department.js'); 
const reportRoutes = require('./routes/reports.js'); 

// ✅ Debug Each Route Before Registering
function checkRoute(route, routeName) {
  if (route) {
    console.log(`✅ Loaded route: ${routeName}`);
  } else {
    console.log(`❌ ERROR: Route not found - ${routeName}`);
  }
}

checkRoute(authRoutes, 'auth.js');
checkRoute(itemRoutes, 'items.js');
checkRoute(categoryRoutes, 'category.js');
checkRoute(departmentRoutes, 'department.js');
checkRoute(reportRoutes, 'reports.js');

// ✅ Register API Routes with Debugging
console.log('🔹 Registering routes...');
app.use('/api/auth', authRoutes);
console.log('✔️ Registered /api/auth');

app.use('/api/items', itemRoutes);
console.log('✔️ Registered /api/items');

app.use('/api/categories', categoryRoutes);
console.log('✔️ Registered /api/categories');

app.use('/api/departments', departmentRoutes);
console.log('✔️ Registered /api/departments');

app.use('/api/reports', reportRoutes);
console.log('✔️ Registered /api/reports');

// MongoDB connection
mongoose.connect(mongoUri)
  .then(() => {
    console.log('✅ MongoDB connected successfully');
  })
  .catch((error) => {
    console.error(`❌ MongoDB connection error: ${error}`);
  });

// Default route
app.get('/', (req, res) => {
  res.send('Hospital Inventory Management API is running');
});

// ✅ Debugging: Print all loaded routes
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log("✅ Loaded routes:");

  app._router.stack.forEach((layer) => {
    if (layer.route) {
      console.log(`- ${layer.route.path}`);
    } else if (layer.name === 'router') {
      layer.handle.stack.forEach((subLayer) => {
        if (subLayer.route) {
          console.log(`- ${subLayer.route.path}`);
        }
      });
    }
  });
});
