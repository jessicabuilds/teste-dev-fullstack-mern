const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const User = require('../models/User');
const RefreshToken = require('../models/RefreshToken');
const jwtConfig = require('../config/jwt');

class AuthService {
  async register(userData) {
    const { name, email, password } = userData;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      throw new Error('Email already registered');
    }

    const user = new User({
      name,
      email,
      password
    });

    await user.save();

    return {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role
    };
  }

  async login(email, password) {
    const user = await User.findOne({ email });
    if (!user) {
      throw new Error('Invalid credentials');
    }

    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      throw new Error('Invalid credentials');
    }

    const accessToken = this.generateAccessToken(user);
    const refreshToken = await this.generateRefreshToken(user);

    return {
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      },
      accessToken,
      refreshToken
    };
  }

  async refreshAccessToken(refreshTokenString) {
    const refreshToken = await RefreshToken.findOne({ token: refreshTokenString });

    if (!refreshToken || !refreshToken.isValid()) {
      throw new Error('Invalid or expired refresh token');
    }

    const user = await User.findById(refreshToken.userId);
    if (!user) {
      throw new Error('User not found');
    }

    const accessToken = this.generateAccessToken(user);

    return { accessToken };
  }

  async logout(refreshTokenString) {
    const refreshToken = await RefreshToken.findOne({ token: refreshTokenString });

    if (refreshToken) {
      refreshToken.isRevoked = true;
      await refreshToken.save();
    }

    return { message: 'Logged out successfully' };
  }

  generateAccessToken(user) {
    const payload = {
      id: user._id,
      email: user.email,
      role: user.role
    };

    return jwt.sign(payload, jwtConfig.secret, {
      expiresIn: jwtConfig.expiresIn
    });
  }

  async generateRefreshToken(user) {
    const token = crypto.randomBytes(40).toString('hex');

    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    const refreshToken = new RefreshToken({
      token,
      userId: user._id,
      expiresAt
    });

    await refreshToken.save();

    return token;
  }
}

module.exports = new AuthService();
