require('dotenv').config();
const express = require('express');
const allocationRoutes = require('./routes/allocationRoutes');

const app = express();
const port = process.env.PORT || 3000;


app.use(express.json());


app.use('/api', allocationRoutes);


app.listen(port, () => {
  console.log(`Smart Discount Engine API listening at http://localhost:${port}`);
});