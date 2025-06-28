const pool = require('../db');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const SECRET = 'your_jwt_secret_key'; // Change this later

exports.registerUser = async (req, res) => {
  const { name, email, password, preferred_language } = req.body;

  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const result = await pool.query(
      'INSERT INTO users (name, email, password, preferred_language) VALUES ($1, $2, $3, $4) RETURNING id, name, email',
      [name, email, hashedPassword, preferred_language || 'en']
    );

    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'User already exists or DB error' });
  }
};

exports.loginUser = async (req, res) => {
  const { email, password } = req.body;

  try {
    const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);

    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const user = result.rows[0];
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const token = jwt.sign({ id: user.id }, SECRET, { expiresIn: '2h' });

    res.json({ token, user: { id: user.id, name: user.name, email: user.email, preferred_language: user.preferred_language } });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'Server error' });
  }
};
