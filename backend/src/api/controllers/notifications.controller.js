const notificationService = require('../../services/notification.service');
const { HttpError } = require('../../middleware/error.middleware');

const getNotifications = async (req, res, next) => {
    try {
        const notifications = await notificationService.getNotificationsByUserId(req.user.id);
        const unreadCount = await notificationService.getUnreadNotificationCount(req.user.id);
        res.json({
            notifications,
            unreadCount,
        });
    } catch (error) {
        next(error);
    }
};

const markNotificationAsRead = async (req, res, next) => {
    try {
        const { notificationId } = req.params;
        const notification = await notificationService.markAsRead(notificationId, req.user.id);
        if (!notification) {
            throw new HttpError(404, 'Notification not found or you do not have permission to read it.', 'NOT_FOUND');
        }
        res.json(notification);
    } catch (error) {
        next(error);
    }
};

const markAllNotificationsAsRead = async (req, res, next) => {
    try {
        await notificationService.markAllAsRead(req.user.id);
        res.status(204).send();
    } catch (error) {
        next(error);
    }
};

module.exports = {
    getNotifications,
    markNotificationAsRead,
    markAllNotificationsAsRead,
};