// 1. CONFIG FILE
require('./config/config.js');

// 2. LIBRARIES
const express = require('express');
const { ObjectId } = require('mongodb');
const { mongoose } = require('./db/mongoose.js');
const userRouter = require('./routes/userRoutes.js');

// 3. DECLARE AND USE IMPORTANT FUNCTIONS
const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 4. INCLUDE ROUTES
app.use('/api/v1/user', userRouter);

// 5. LISTEN TO REQUESTS
app.listen(port, () => {
  console.log(`Started up at port ${port}`);
});

module.exports = app;
