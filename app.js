const express = require('express');
const connectDB = require('./config/db');
const path = require('path');
require('dotenv').config(); 
const cors = require('cors')
// Create express app
const app = express();

// Connect to database
connectDB();

// Middleware
app.use(cors())
app.use(express.json());

// Define routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/orgs', require('./routes/orgs'));
app.use('/api/projects', require('./routes/projects'));
app.use('/api/tasks', require('./routes/tasks'));
app.use('/api/teams', require('./routes/teams'));
app.use('/api/chat', require('./routes/chat'));
app.use('/api/utility-items', require('./routes/utilityItems')); // <--- NEW: Mount utility item routes
app.use('/api/events', require('./routes/eventRoutes'))

module.exports = app;