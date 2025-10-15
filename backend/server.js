require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

const app = express();
const port = process.env.PORT || 5001;

// --- Middleware ---
app.use(cors());
// This line is crucial - it allows your server to understand and process JSON data sent from the frontend.
app.use(express.json()); 
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// --- Database Connections ---

// MongoDB Connection
mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log('MongoDB Connected...'))
    .catch(err => {
        console.error('MongoDB Connection Error:', err);
        process.exit(1);
    });

// Supabase Client Initialization
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
    console.error("Supabase URL or Anon Key is missing from .env file.");
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);
app.set('supabase', supabase); // Make supabase client available in routes

// --- API Routes ---
const apiRoutes = require('./routes/api');
app.use('/api', apiRoutes);


// --- Start Server ---
app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});

