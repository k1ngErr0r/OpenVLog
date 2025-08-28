const pool = require('../config/db');

const addAttachment = async (vulnerability_id, file_name, file_path, mime_type, file_size) => {
    const result = await pool.query(
        'INSERT INTO vulnerability_attachments (vulnerability_id, file_name, file_path, mime_type, file_size) VALUES ($1, $2, $3, $4, $5) RETURNING id, file_name, mime_type, file_size, created_at',
        [vulnerability_id, file_name, file_path, mime_type, file_size]
    );
    return result.rows[0];
};

const getAttachmentsByVulnerabilityId = async (vulnerability_id) => {
    const result = await pool.query('SELECT id, file_name, mime_type, file_size, created_at FROM vulnerability_attachments WHERE vulnerability_id = $1 ORDER BY created_at DESC', [vulnerability_id]);
    return result.rows;
};

const getAttachmentById = async (id) => {
    const result = await pool.query('SELECT * FROM vulnerability_attachments WHERE id = $1', [id]);
    return result.rows[0];
};

const deleteAttachment = async (id) => {
    const result = await pool.query('DELETE FROM vulnerability_attachments WHERE id = $1 RETURNING *', [id]);
    return result.rows[0];
};

module.exports = {
    addAttachment,
    getAttachmentsByVulnerabilityId,
    getAttachmentById,
    deleteAttachment,
};