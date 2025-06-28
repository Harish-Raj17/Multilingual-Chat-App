const pool = require('./db'); // db.js should contain PostgreSQL connection setup

const initTables = async () => {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        username TEXT UNIQUE NOT NULL,
        language TEXT,
        created_at TIMESTAMP DEFAULT NOW()
      );
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS messages (
        id SERIAL PRIMARY KEY,
        sender_id INTEGER REFERENCES users(id),
        text TEXT,
        lang TEXT,
        timestamp TIMESTAMP DEFAULT NOW()
      );
    `);

    console.log("✅ Tables created successfully");
  } catch (err) {
    console.error("❌ Error creating tables:", err);
  }
};

initTables();
