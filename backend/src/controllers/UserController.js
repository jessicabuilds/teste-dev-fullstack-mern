const User = require('../models/User');

class UserController {
  async getProfile(req, res, next) {
    try {
      const userId = req.user.id;

      const user = await User.findById(userId).select('-password');

      if (!user) {
        const error = new Error('User not found');
        error.statusCode = 404;
        throw error;
      }

      res.status(200).json({
        success: true,
        data: user
      });
    } catch (error) {
      next(error);
    }
  }

  async updateProfile(req, res, next) {
    try {
      const userId = req.user.id;
      const { name, address, phone } = req.body;

      const updateData = {};
      if (name) updateData.name = name;
      if (address) updateData.address = address;
      if (phone) updateData.phone = phone;

      const user = await User.findByIdAndUpdate(
        userId,
        updateData,
        { new: true, runValidators: true }
      ).select('-password');

      if (!user) {
        const error = new Error('User not found');
        error.statusCode = 404;
        throw error;
      }

      res.status(200).json({
        success: true,
        message: 'Profile updated successfully',
        data: user
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new UserController();
