const notificationService = require('../../services/notification.service');
const { HttpError } = require('../../middleware/error.middleware');

const currentUserId = (req) => req.user && (req.user.userId || req.user.id); // fallback if legacy

const getNotifications = async (req, res, next) => {
    try {
        const uid = currentUserId(req);
        if (!uid) throw new HttpError(401, 'Unauthorized', 'AUTH');
        const notifications = await notificationService.getNotificationsByUserId(uid);
        const unreadCount = await notificationService.getUnreadNotificationCount(uid);
        res.json({ notifications, unreadCount });
    } catch (error) {
        next(error);
    }
};

const markNotificationAsRead = async (req, res, next) => {
    try {
        const uid = currentUserId(req);
        if (!uid) throw new HttpError(401, 'Unauthorized', 'AUTH');
        const { notificationId } = req.params;
        const notification = await notificationService.markAsRead(notificationId, uid);
        if (!notification) throw new HttpError(404, 'Notification not found or you do not have permission to read it.', 'NOT_FOUND');
        res.json(notification);
    } catch (error) {
        next(error);
    }
};

const markAllNotificationsAsRead = async (req, res, next) => {
    try {
        const uid = currentUserId(req);
        if (!uid) throw new HttpError(401, 'Unauthorized', 'AUTH');
        await notificationService.markAllAsRead(uid);
        res.status(204).send();
    } catch (error) {
        next(error);
    }
};

module.exports = { getNotifications, markNotificationAsRead, markAllNotificationsAsRead };