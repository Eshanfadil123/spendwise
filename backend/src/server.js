require('dotenv').config();
const app = require('./app');
const connectDB = require('./config/db');

const PORT = process.env.PORT || 5000;

// Start listening immediately so Render and cloud health checks succeed without timeout
const server = app.listen(PORT, () => {
  console.log(`[SpendWise API] Server running on port ${PORT}`);
  console.log(`[SpendWise API] Health check at http://localhost:${PORT}/api/health`);
});

// Connect to database in the background
connectDB().catch((err) => {
  console.error('[MongoDB] Initialization error:', err.message);
});
