const multer = require('multer');
const path = require('path');
const fs = require('fs');
const attachmentService = require('../../services/attachment.service');
const { HttpError } = require('../../middleware/error.middleware');

// --- Multer Setup ---
const UPLOAD_DIR = path.join(__dirname, '../../../uploads');

// Ensure upload directory exists
if (!fs.existsSync(UPLOAD_DIR)) {
    fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, UPLOAD_DIR);
    },
    filename: function (req, file, cb) {
        // Create a unique filename to avoid collisions
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({ 
    storage: storage,
    limits: { fileSize: 10 * 1024 * 1024 } // 10MB file size limit
}).single('attachment'); // 'attachment' is the name of the form field

// --- Controller Functions ---

const uploadAttachment = (req, res, next) => {
    upload(req, res, async function (err) {
        if (err) {
            if (err instanceof multer.MulterError) {
                return next(new HttpError(400, `Upload error: ${err.message}`, 'UPLOAD_ERROR'));
            }
            return next(new HttpError(500, `Unknown upload error: ${err.message}`, 'UPLOAD_ERROR'));
        }
        if (!req.file) {
            return next(new HttpError(400, 'No file was uploaded.', 'VALIDATION'));
        }

        const { vulnerabilityId } = req.params;
        const { filename, mimetype, size } = req.file;

        try {
            const attachment = await attachmentService.addAttachment(
                vulnerabilityId,
                req.file.originalname, // Store the original name for user-friendliness
                filename, // Store the generated, unique filename as the path
                mimetype,
                size
            );
            res.status(201).json(attachment);
        } catch (error) {
            // If DB insertion fails, delete the orphaned file
            const filePath = path.join(UPLOAD_DIR, filename);
            fs.unlink(filePath, (unlinkErr) => {
                if (unlinkErr) console.error("Error deleting orphaned file:", unlinkErr);
            });
            next(error);
        }
    });
};

const getAttachments = async (req, res, next) => {
    try {
        const { vulnerabilityId } = req.params;
        const attachments = await attachmentService.getAttachmentsByVulnerabilityId(vulnerabilityId);
        res.json(attachments);
    } catch (error) {
        next(error);
    }
};

const downloadAttachment = async (req, res, next) => {
    try {
        const { attachmentId } = req.params;
        const attachment = await attachmentService.getAttachmentById(attachmentId);

        if (!attachment) {
            throw new HttpError(404, 'Attachment not found', 'NOT_FOUND');
        }

        const filePath = path.join(UPLOAD_DIR, attachment.file_path);

        // Ensure file exists before attempting to send
        if (!fs.existsSync(filePath)) {
            throw new HttpError(404, 'File not found on disk.', 'NOT_FOUND');
        }

        res.download(filePath, attachment.file_name); // The third argument (callback) is optional
    } catch (error) {
        next(error);
    }
};

const deleteAttachment = async (req, res, next) => {
    try {
        const { attachmentId } = req.params;
        // Admin check is handled in the route
        const attachment = await attachmentService.getAttachmentById(attachmentId);

        if (!attachment) {
            // If already deleted, that's fine. Return success.
            return res.status(204).send();
        }

        // Delete file from filesystem
        const filePath = path.join(UPLOAD_DIR, attachment.file_path);
        if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
        }
        
        // Delete record from database
        await attachmentService.deleteAttachment(attachmentId);
        res.status(204).send();

    } catch (error) {
        next(error);
    }
};

module.exports = {
    uploadAttachment,
    getAttachments,
    downloadAttachment,
    deleteAttachment,
};