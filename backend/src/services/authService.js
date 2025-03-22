// backend/src/services/authService.js
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

// In-memory user store (Replace with your database solution)
const users = [];

// Secret key for JWT – store this in your .env in production.
const JWT_SECRET = process.env.JWT_SECRET || 'mysecretkey';

// Register a new user
async function registerUser(username, password) {
  const existingUser = users.find(user => user.username === username);
  if (existingUser) {
    throw new Error('User already exists');
  }
  // Hash the password before storing
  const hashedPassword = await bcrypt.hash(password, 10);
  const newUser = { id: users.length + 1, username, password: hashedPassword };
  users.push(newUser);
  return newUser;
}

// Authenticate a user
async function authenticateUser(username, password) {
  const user = users.find(user => user.username === username);
  if (!user) {
    throw new Error('User not found');
  }
  const passwordMatch = await bcrypt.compare(password, user.password);
  if (!passwordMatch) {
    throw new Error('Invalid password');
  }
  // Generate JWT token
  const token = jwt.sign({ id: user.id, username: user.username }, JWT_SECRET, { expiresIn: '1h' });
  return token;
}

// Middleware to verify JWT token
function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) return res.sendStatus(401);

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.sendStatus(403);
    req.user = user; // attach user info to the request
    next();
  });
}

module.exports = {
  registerUser,
  authenticateUser,
  authenticateToken,
  users // for testing purposes
};
