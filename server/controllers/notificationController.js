const Notification = require('../models/Notification');
const { sendSuccess, sendError } = require('../utils/apiResponse');

// @desc    Get all notifications for logged in user
// @route   GET /api/notifications
// @access  Private
const getMyNotifications = async (req, res, next) => {
  try {
    const notifications = await Notification.find({ recipient: req.user._id })
      .populate('sender', 'name email avatar')
      .sort({ createdAt: -1 })
      .limit(30);

    const unreadCount = await Notification.countDocuments({
      recipient: req.user._id,
      isRead: false,
    });

    return sendSuccess(res, 200, 'Notifications retrieved.', {
      notifications,
      unreadCount,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Mark a single notification as read
// @route   PATCH /api/notifications/:id/read
// @access  Private
const markAsRead = async (req, res, next) => {
  try {
    const notification = await Notification.findOneAndUpdate(
      { _id: req.params.id, recipient: req.user._id },
      { isRead: true },
      { new: true }
    );

    if (!notification) {
      return sendError(res, 404, 'Notification not found.');
    }

    return sendSuccess(res, 200, 'Notification marked as read.', notification);
  } catch (error) {
    next(error);
  }
};

// @desc    Mark all user notifications as read
// @route   PATCH /api/notifications/read-all
// @access  Private
const markAllAsRead = async (req, res, next) => {
  try {
    await Notification.updateMany({ recipient: req.user._id, isRead: false }, { isRead: true });

    return sendSuccess(res, 200, 'All notifications marked as read.');
  } catch (error) {
    next(error);
  }
};

// @desc    Delete a notification
// @route   DELETE /api/notifications/:id
// @access  Private
const deleteNotification = async (req, res, next) => {
  try {
    const removed = await Notification.findOneAndDelete({
      _id: req.params.id,
      recipient: req.user._id,
    });

    if (!removed) {
      return sendError(res, 404, 'Notification not found.');
    }

    return sendSuccess(res, 200, 'Notification deleted.');
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getMyNotifications,
  markAsRead,
  markAllAsRead,
  deleteNotification,
};
