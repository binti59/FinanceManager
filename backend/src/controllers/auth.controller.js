const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const db = require('../models');
const User = db.user;

// Register a new user
exports.register = async (req, res) => {
  try {
    // Create user
    const user = await User.create({
      username: req.body.username,
      email: req.body.email,
      password: bcrypt.hashSync(req.body.password, 8)
    });
    
    res.status(201).send({ message: "User registered successfully!" });
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
};

// User login
exports.login = async (req, res) => {
  try {
    // Find user
    const user = await User.findOne({
      where: {
        username: req.body.username
      }
    });
    
    if (!user) {
      return res.status(404).send({ message: "User not found." });
    }
    
    // Verify password
    const passwordIsValid = bcrypt.compareSync(
      req.body.password,
      user.password
    );
    
    if (!passwordIsValid) {
      return res.status(401).send({
        accessToken: null,
        message: "Invalid password!"
      });
    }
    
    // Generate token
    const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRATION
    });
    
    res.status(200).send({
      id: user.id,
      username: user.username,
      email: user.email,
      accessToken: token
    });
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
};

// Get user profile
exports.profile = async (req, res) => {
  try {
    const user = await User.findByPk(req.userId);
    if (!user) {
      return res.status(404).send({ message: "User not found." });
    }
    
    res.status(200).send({
      id: user.id,
      username: user.username,
      email: user.email
    });
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
};
