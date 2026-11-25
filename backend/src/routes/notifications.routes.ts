import { Router } from 'express';
import { notificationsController } from '../controllers/notifications.controller.js';
import { authenticateToken } from '../middleware/auth.middleware.js';

const router = Router();

router.use(authenticateToken);

router.get('/', notificationsController.getNotifications);
router.put('/read-all', notificationsController.markAllRead);
router.put('/:id/read', notificationsController.markAsRead);
router.delete('/:id', notificationsController.deleteNotification);
router.delete('/', notificationsController.clearNotifications);

export default router;
