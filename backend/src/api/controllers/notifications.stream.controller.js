const notificationService = require('../../services/notification.service');
const { HttpError } = require('../../middleware/error.middleware');

const currentUserId = (req) => req.user && (req.user.userId || req.user.id);

// SSE stream controller
const notificationsStream = async (req, res, next) => {
  try {
    const uid = currentUserId(req);
    if (!uid) throw new HttpError(401, 'Unauthorized', 'AUTH');
    res.writeHead(200, {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      Connection: 'keep-alive',
    });

    // Initial snapshot
    const notifications = await notificationService.getNotificationsByUserId(uid);
    const unreadCount = await notificationService.getUnreadNotificationCount(uid);
    res.write(`event: snapshot\n`);
    res.write(`data: ${JSON.stringify({ notifications, unreadCount })}\n\n`);

    // Heartbeat
    const heartbeat = setInterval(() => {
      res.write(`event: ping\n`);
      res.write('data: {}\n\n');
    }, 25000);

    // Subscribe to new notifications
    const unsubscribe = notificationService.subscribe(uid, (notification) => {
      res.write(`event: notification\n`);
      res.write(`data: ${JSON.stringify(notification)}\n\n`);
    });

    req.on('close', () => {
      clearInterval(heartbeat);
      unsubscribe();
    });
  } catch (e) {
    next(e);
  }
};

module.exports = { notificationsStream };