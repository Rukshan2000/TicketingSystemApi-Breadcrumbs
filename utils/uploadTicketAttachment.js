const { PutObjectCommand } = require("@aws-sdk/client-s3");
const s3 = require("../config/s3");

/**
 * Upload ticket attachment to S3/MinIO
 * @param {Object} file - File object from multer
 * @param {Number} ticketId - Ticket ID
 * @returns {Object} Object with filename, url, and metadata
 */
module.exports = async function uploadTicketAttachment(file, ticketId) {
  if (!file) {
    throw new Error('No file provided');
  }

  if (!ticketId) {
    throw new Error('Ticket ID is required');
  }

  // S3 key structure: tickets/[ticketId]/[timestamp]-[filename]
  const timestamp = Date.now();
  const fileName = `tickets/${ticketId}/${timestamp}-${file.originalname}`;

  const params = {
    Bucket: process.env.AWS_BUCKET,
    Key: fileName,
    Body: file.buffer,
    ContentType: file.mimetype,
  };

  try {
    await s3.send(new PutObjectCommand(params));
    console.log(`✓ Attachment uploaded to S3: ${fileName}`);
  } catch (error) {
    console.error('S3 Upload Error:', error);
    throw new Error(`Failed to upload attachment: ${error.message}`);
  }

  // Generate public URL
  const endpoint = process.env.AWS_ENDPOINT || 'http://207.180.232.61:9002';
  const bucket = process.env.AWS_BUCKET || 'ticketing';
  
  // Format: http://207.180.232.61:9002/ticketing/tickets/1/1234567890-filename.pdf
  const publicUrl = `${endpoint}/${bucket}/${fileName}`;

  return {
    filename: file.originalname,
    url: publicUrl,
    s3Key: fileName,
    mimetype: file.mimetype,
    size: file.size,
    uploadedAt: new Date().toISOString(),
  };
};
