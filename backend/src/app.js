require('dotenv').config();
const express = require('express');
const cors = require('cors');
const anilistRoutes = require('./routes/anilistRoutes');
const searchRoutes = require('./routes/searchRoutes');  // Newly added

const app = express();
const PORT = process.env.PORT || 5001;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/anilist', anilistRoutes);
app.use('/api/search', searchRoutes);  // Register search routes

// Root route
app.get('/', (req, res) => {
  res.send('Manga Tracker API is running!');
});

// Start server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
