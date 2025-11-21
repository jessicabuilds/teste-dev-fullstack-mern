const mongoose = require('mongoose');
const AuthService = require('../../src/services/AuthService');
const User = require('../../src/models/User');
const RefreshToken = require('../../src/models/RefreshToken');

describe('AuthService', () => {
  beforeAll(async () => {
    await mongoose.connect(process.env.MONGODB_URI_TEST);
  });

  afterAll(async () => {
    await mongoose.connection.close();
  });

  beforeEach(async () => {
    await User.deleteMany({});
    await RefreshToken.deleteMany({});
  });

  describe('register', () => {
    it('should register a new user successfully', async () => {
      const userData = {
        name: 'John Doe',
        email: 'john@example.com',
        password: 'password123'
      };

      const result = await AuthService.register(userData);

      expect(result).toHaveProperty('id');
      expect(result.name).toBe(userData.name);
      expect(result.email).toBe(userData.email);
      expect(result.role).toBe('user');
      expect(result.password).toBeUndefined();
    });

    it('should hash the password', async () => {
      const userData = {
        name: 'John Doe',
        email: 'john@example.com',
        password: 'password123'
      };

      await AuthService.register(userData);

      const user = await User.findOne({ email: userData.email });
      expect(user.password).not.toBe(userData.password);
    });

    it('should throw error if email already exists', async () => {
      const userData = {
        name: 'John Doe',
        email: 'john@example.com',
        password: 'password123'
      };

      await AuthService.register(userData);

      await expect(AuthService.register(userData)).rejects.toThrow('Email already registered');
    });
  });

  describe('login', () => {
    beforeEach(async () => {
      await AuthService.register({
        name: 'John Doe',
        email: 'john@example.com',
        password: 'password123'
      });
    });

    it('should login successfully with valid credentials', async () => {
      const result = await AuthService.login('john@example.com', 'password123');

      expect(result).toHaveProperty('user');
      expect(result).toHaveProperty('accessToken');
      expect(result).toHaveProperty('refreshToken');
      expect(result.user.email).toBe('john@example.com');
    });

    it('should generate valid JWT token', async () => {
      const result = await AuthService.login('john@example.com', 'password123');

      expect(typeof result.accessToken).toBe('string');
      expect(result.accessToken.split('.').length).toBe(3);
    });

    it('should create refresh token in database', async () => {
      const result = await AuthService.login('john@example.com', 'password123');

      const refreshToken = await RefreshToken.findOne({ token: result.refreshToken });
      expect(refreshToken).toBeDefined();
      expect(refreshToken.isRevoked).toBe(false);
    });

    it('should throw error with invalid email', async () => {
      await expect(
        AuthService.login('wrong@example.com', 'password123')
      ).rejects.toThrow('Invalid credentials');
    });

    it('should throw error with invalid password', async () => {
      await expect(
        AuthService.login('john@example.com', 'wrongpassword')
      ).rejects.toThrow('Invalid credentials');
    });
  });

  describe('refreshAccessToken', () => {
    let refreshToken;

    beforeEach(async () => {
      await AuthService.register({
        name: 'John Doe',
        email: 'john@example.com',
        password: 'password123'
      });

      const loginResult = await AuthService.login('john@example.com', 'password123');
      refreshToken = loginResult.refreshToken;
    });

    it('should generate new access token with valid refresh token', async () => {
      const result = await AuthService.refreshAccessToken(refreshToken);

      expect(result).toHaveProperty('accessToken');
      expect(typeof result.accessToken).toBe('string');
    });

    it('should throw error with invalid refresh token', async () => {
      await expect(
        AuthService.refreshAccessToken('invalid-token')
      ).rejects.toThrow('Invalid or expired refresh token');
    });

    it('should throw error with revoked refresh token', async () => {
      await AuthService.logout(refreshToken);

      await expect(
        AuthService.refreshAccessToken(refreshToken)
      ).rejects.toThrow('Invalid or expired refresh token');
    });
  });

  describe('logout', () => {
    let refreshToken;

    beforeEach(async () => {
      await AuthService.register({
        name: 'John Doe',
        email: 'john@example.com',
        password: 'password123'
      });

      const loginResult = await AuthService.login('john@example.com', 'password123');
      refreshToken = loginResult.refreshToken;
    });

    it('should revoke refresh token on logout', async () => {
      await AuthService.logout(refreshToken);

      const token = await RefreshToken.findOne({ token: refreshToken });
      expect(token.isRevoked).toBe(true);
    });

    it('should return success message', async () => {
      const result = await AuthService.logout(refreshToken);

      expect(result.message).toBe('Logged out successfully');
    });

    it('should handle logout with non-existent token gracefully', async () => {
      const result = await AuthService.logout('non-existent-token');

      expect(result.message).toBe('Logged out successfully');
    });
  });
});
