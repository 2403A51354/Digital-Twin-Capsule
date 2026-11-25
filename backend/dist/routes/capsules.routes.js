import { Router } from 'express';
import multer from 'multer';
import { capsulesController } from '../controllers/capsules.controller.js';
import { authenticateToken } from '../middleware/auth.middleware.js';
import { enforceTemporalGate } from '../middleware/temporalLock.middleware.js';
const router = Router();
const ALLOWED_MIME_TYPES = [
    'image/jpeg',
    'image/png',
    'image/gif',
    'image/webp',
    'video/mp4',
    'video/webm',
    'video/quicktime',
    'application/pdf',
    'text/plain',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
];
const upload = multer({
    storage: multer.memoryStorage(),
    limits: {
        fileSize: 50 * 1024 * 1024,
        files: 10,
    },
    fileFilter: (req, file, cb) => {
        if (ALLOWED_MIME_TYPES.includes(file.mimetype)) {
            cb(null, true);
        }
        else {
            cb(new Error(`Unsupported file type: ${file.mimetype}. Allowed types: Images, Videos, PDFs, and Documents.`));
        }
    },
});
// Server Time endpoint (Publicly queryable for client clock synchronization)
router.get('/server-time', (req, res) => {
    res.status(200).json({
        server_time: new Date().toISOString(),
        server_timestamp: Date.now(),
        timezone: 'UTC',
    });
});
// Protected routes
router.use(authenticateToken);
router.post('/', upload.array('files', 10), capsulesController.createCapsule);
router.get('/', capsulesController.getUserCapsules);
router.get('/:id', capsulesController.getCapsuleById);
router.put('/:id', enforceTemporalGate, capsulesController.updateCapsule);
router.delete('/:id', capsulesController.deleteCapsule);
router.post('/:id/open', enforceTemporalGate, capsulesController.openCapsule);
export default router;
