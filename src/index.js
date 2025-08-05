require('dotenv').config();
const express = require('express');
const allocationRoutes = require('./routes/allocationRoutes');

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(express.json());

// Routes
app.use('/api', allocationRoutes);

// Server Start
app.listen(port, () => {
  console.log(`Smart Discount Engine API listening at http://localhost:${port}`);
});