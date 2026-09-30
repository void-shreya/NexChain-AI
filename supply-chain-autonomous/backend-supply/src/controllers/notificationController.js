const { db } = require('../database/dbClient');

const getNotifications = async (req, res, next) => {
  try {
    const notifications = await db.getNotifications();
    const unreadCount = notifications.filter((n) => !n.is_read).length;

    res.json({
      success: true,
      unreadCount,
      count: notifications.length,
      data: notifications,
    });
  } catch (err) {
    next(err);
  }
};

const markAsRead = async (req, res, next) => {
  try {
    const { id } = req.params;
    const updated = await db.markNotificationRead(id);
    if (!updated) {
      return res.status(404).json({ success: false, error: 'Notification not found' });
    }
    res.json({ success: true, data: updated });
  } catch (err) {
    next(err);
  }
};

const markAllAsRead = async (req, res, next) => {
  try {
    await db.markAllNotificationsRead();
    res.json({ success: true, message: 'All notifications marked as read' });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getNotifications,
  markAsRead,
  markAllAsRead,
};
