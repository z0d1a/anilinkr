require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { authenticateToken } = require('./services/authService'); // Add this line

// Existing routes
const anilistRoutes = require('./routes/anilistRoutes');
const searchRoutes = require('./routes/searchRoutes');
const externalSearchRoutes = require('./routes/externalSearchRoutes');
const externalSearchController = require('./controllers/externalSearchController');
const featuredController = require('./controllers/featuredController');
const featuredAsuraRoutes = require('./routes/featuredRoutes');
const chatbotController = require('./controllers/chatbotController'); // Add this line

const app = express();
const PORT = process.env.PORT || 5001;

// Middleware
// Update CORS configuration to allow credentials
app.use(cors({
  origin: 'http://localhost:3000', // Your frontend URL
  credentials: true
}));
app.use(express.json());

// Routes
app.use('/api/anilist', anilistRoutes);
app.use('/api/search', searchRoutes);  
app.use('/api/search', externalSearchRoutes);

// External search
app.use('/api/external/:id', externalSearchController.searchMangaExternal);

// Omegascans featured
app.use('/api/featured/omegascans', featuredController.getFeaturedOmegascansController);

// AsuraScans featured
app.use('/api/featured', featuredAsuraRoutes);

// Add chatbot route
app.post('/api/chat/recommend', chatbotController.getRecommendation); // Add this line

// Root route
app.get('/', (req, res) => { 
  res.send('Manga Tracker API is running!');
});

// Start server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});