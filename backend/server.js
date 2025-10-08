const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5001;

// Middleware
app.use(cors());
app.use(express.json()); // for parsing application/json
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));


// --- Database Connection ---
const MONGO_URI = process.env.MONGO_URI;

mongoose.connect(MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
})
.then(() => console.log("MongoDB Connected..."))
.catch(err => console.log("MongoDB Connection Error:", err));


// --- API Routes ---
const apiRoutes = require('./routes/api');
app.use('/api', apiRoutes);


// --- Server Listening ---
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});

