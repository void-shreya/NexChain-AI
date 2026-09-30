const bcrypt = require('bcryptjs');
const { db } = require('../database/dbClient');
const { generateToken } = require('../config/jwt');

const register = async (req, res, next) => {
  try {
    const { email, password, full_name, role_id } = req.body;

    if (!email || !password || !full_name) {
      return res.status(400).json({ success: false, error: 'Email, password, and full name are required.' });
    }

    const existing = await db.findUserByEmail(email);
    if (existing) {
      return res.status(409).json({ success: false, error: 'User with this email already exists.' });
    }

    const password_hash = await bcrypt.hash(password, 10);
    const newUser = await db.createUser({
      email,
      password_hash,
      full_name,
      role_id: role_id || 'SUPPLY_MANAGER',
    });

    const token = generateToken({ id: newUser.id, email: newUser.email, role_id: newUser.role_id });

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      data: {
        token,
        user: {
          id: newUser.id,
          email: newUser.email,
          full_name: newUser.full_name,
          role_id: newUser.role_id,
        },
      },
    });
  } catch (err) {
    next(err);
  }
};

const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, error: 'Email and password are required.' });
    }

    const user = await db.findUserByEmail(email);
    if (!user) {
      return res.status(401).json({ success: false, error: 'Invalid email or password.' });
    }

    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      return res.status(401).json({ success: false, error: 'Invalid email or password.' });
    }

    const token = generateToken({ id: user.id, email: user.email, role_id: user.role_id });

    res.json({
      success: true,
      message: 'Login successful',
      data: {
        token,
        user: {
          id: user.id,
          email: user.email,
          full_name: user.full_name,
          role_id: user.role_id,
          avatar_url: user.avatar_url,
        },
      },
    });
  } catch (err) {
    next(err);
  }
};

const me = async (req, res) => {
  res.json({
    success: true,
    data: {
      user: {
        id: req.user.id,
        email: req.user.email,
        full_name: req.user.full_name,
        role_id: req.user.role_id,
        avatar_url: req.user.avatar_url,
      },
    },
  });
};

const logout = async (req, res) => {
  res.json({
    success: true,
    message: 'Logged out successfully.',
  });
};

module.exports = {
  register,
  login,
  me,
  logout,
};
