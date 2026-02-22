require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const mysql = require('mysql2/promise');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// MySQL Connection Pool
const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT) || 3306,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME || 'workout',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// Make pool available to routes
app.locals.pool = pool;

// API Routes
const workoutsRouter = require('./routes/workouts');
const muscleGroupsRouter = require('./routes/muscle-groups');
const setsRouter = require('./routes/sets');

app.use('/api/workouts', workoutsRouter);
app.use('/api/muscle-groups', muscleGroupsRouter);
app.use('/api/sets', setsRouter);

// Serve frontend for all non-API routes
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Start server
async function start() {
  try {
    // Test DB connection
    const connection = await pool.getConnection();
    console.log('✅ Connected to MySQL database');
    connection.release();

    app.listen(PORT, () => {
      console.log(`🏋️ Sport Log server running at http://localhost:${PORT}`);
    });
  } catch (err) {
    console.error('❌ Failed to connect to MySQL:', err.message);
    console.error('   Check your .env file and make sure MySQL is running.');
    process.exit(1);
  }
}

start();
