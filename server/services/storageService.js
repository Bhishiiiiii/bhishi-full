import { v2 as cloudinary } from 'cloudinary';
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import { fileURLToPath } from 'url';
import { JWT_SECRET } from '../middleware/auth.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const UPLOADS_DIR = path.join(__dirname, '../uploads');

// Ensure uploads directory exists for fallback
if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}

class StorageService {
  constructor() {
    this.isCloudinaryConfigured = false;
    this.init();
  }

  init() {
    const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
    const apiKey = process.env.CLOUDINARY_API_KEY;
    const apiSecret = process.env.CLOUDINARY_API_SECRET;

    if (cloudName && apiKey && apiSecret && cloudName.trim() !== '') {
      cloudinary.config({
        cloud_name: cloudName.trim(),
        api_key: apiKey.trim(),
        api_secret: apiSecret.trim(),
        secure: true
      });
      this.isCloudinaryConfigured = true;
      console.log('[StorageService] Cloudinary configured with type: "authenticated" (private storage).');
    } else {
      this.isCloudinaryConfigured = false;
      console.warn('[StorageService] Cloudinary credentials not configured; falling back to local private disk storage under server/uploads.');
    }
  }

  /**
   * Validate file buffer using magic bytes (not just mimetype / extension)
   * Allowed: JPEG, PNG, WEBP, PDF
   */
  validateMagicBytes(buffer) {
    if (!buffer || buffer.length < 12) {
      return { valid: false, error: 'File buffer too small or empty' };
    }

    // 1. JPEG: FF D8 FF
    if (buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff) {
      return { valid: true, mime: 'image/jpeg', ext: 'jpg' };
    }

    // 2. PNG: 89 50 4E 47 0D 0A 1A 0A
    if (
      buffer[0] === 0x89 &&
      buffer[1] === 0x50 &&
      buffer[2] === 0x4e &&
      buffer[3] === 0x47 &&
      buffer[4] === 0x0d &&
      buffer[5] === 0x0a &&
      buffer[6] === 0x1a &&
      buffer[7] === 0x0a
    ) {
      return { valid: true, mime: 'image/png', ext: 'png' };
    }

    // 3. WEBP: RIFF....WEBP (bytes 0-3: 52 49 46 46, bytes 8-11: 57 45 42 50)
    if (
      buffer[0] === 0x52 &&
      buffer[1] === 0x49 &&
      buffer[2] === 0x46 &&
      buffer[3] === 0x46 &&
      buffer[8] === 0x57 &&
      buffer[9] === 0x45 &&
      buffer[10] === 0x42 &&
      buffer[11] === 0x50
    ) {
      return { valid: true, mime: 'image/webp', ext: 'webp' };
    }

    // 4. PDF: %PDF (25 50 44 46)
    if (
      buffer[0] === 0x25 &&
      buffer[1] === 0x50 &&
      buffer[2] === 0x44 &&
      buffer[3] === 0x46
    ) {
      return { valid: true, mime: 'application/pdf', ext: 'pdf' };
    }

    return {
      valid: false,
      error: 'Invalid file format. Only JPEG, PNG, WEBP, and PDF documents are permitted.'
    };
  }

  /**
   * Compute deterministic 0x-prefixed 32-byte SHA-256 hash of a file buffer
   */
  computeSha256(buffer) {
    const hash = crypto.createHash('sha256').update(buffer).digest('hex');
    return `0x${hash}`;
  }

  /**
   * Upload asset buffer as authenticated/private
   */
  async uploadCollateralFile({ buffer, originalName, mimeType, joinRequestId, assetId }) {
    // 1. Validate magic bytes
    const magicCheck = this.validateMagicBytes(buffer);
    if (!magicCheck.valid) {
      const err = new Error(magicCheck.error);
      err.status = 415;
      throw err;
    }

    // 2. Compute SHA-256 hash server-side BEFORE uploading
    const sha256Hash = this.computeSha256(buffer);
    const sizeBytes = buffer.length;

    // 3. If Cloudinary is available, upload as authenticated
    if (this.isCloudinaryConfigured) {
      try {
        const isPdf = magicCheck.mime === 'application/pdf';
        const publicId = `bishi_collateral/${joinRequestId}/${assetId}`;

        const uploadResult = await new Promise((resolve, reject) => {
          const uploadStream = cloudinary.uploader.upload_stream(
            {
              public_id: publicId,
              type: 'authenticated', // STRICTLY PRIVATE / AUTHENTICATED
              resource_type: isPdf ? 'raw' : 'image',
              overwrite: true
            },
            (error, result) => {
              if (error) return reject(error);
              resolve(result);
            }
          );
          uploadStream.end(buffer);
        });

        return {
          sha256Hash,
          sizeBytes,
          mimeType: magicCheck.mime,
          cloudinaryPublicId: uploadResult.public_id,
          storageType: 'cloudinary'
        };
      } catch (cloudErr) {
        console.warn(`[StorageService] Cloudinary upload failed: ${cloudErr.message}. Falling back to disk storage.`);
      }
    }

    // 4. Local private disk storage fallback
    const safeExt = magicCheck.ext;
    const localFileName = `${assetId}.${safeExt}`;
    const localFilePath = path.join(UPLOADS_DIR, localFileName);
    fs.writeFileSync(localFilePath, buffer);

    return {
      sha256Hash,
      sizeBytes,
      mimeType: magicCheck.mime,
      localFilePath,
      storageType: 'local'
    };
  }

  /**
   * Generate short-lived signed URL (expires in 5 minutes = 300 seconds)
   */
  generateSignedViewUrl(asset, req) {
    const expiresInSeconds = 300; // 5 minutes

    if (this.isCloudinaryConfigured && asset.cloudinaryPublicId) {
      const isPdf = asset.mimeType === 'application/pdf';
      const expiresAt = Math.floor(Date.now() / 1000) + expiresInSeconds;
      const format = isPdf ? 'pdf' : path.extname(asset.fileName).replace('.', '') || 'jpg';

      const signedUrl = cloudinary.utils.private_download_url(
        asset.cloudinaryPublicId,
        format,
        {
          type: 'authenticated',
          expires_at: expiresAt,
          resource_type: isPdf ? 'raw' : 'image'
        }
      );
      return {
        url: signedUrl,
        expiresInSeconds,
        expiresAt: new Date(Date.now() + expiresInSeconds * 1000).toISOString()
      };
    }

    // Local storage fallback: generate a signed token URL
    const token = jwt.sign(
      { assetId: asset.id, purpose: 'collateral_view' },
      JWT_SECRET,
      { expiresIn: '5m' }
    );

    const protocol = req?.protocol || 'http';
    const host = req?.get('host') || 'localhost:5001';
    const url = `${protocol}://${host}/api/collateral/${asset.id}/file?token=${token}`;

    return {
      url,
      expiresInSeconds,
      expiresAt: new Date(Date.now() + expiresInSeconds * 1000).toISOString()
    };
  }

  /**
   * Retrieve file buffer for SHA-256 integrity re-verification
   */
  async getFileBuffer(asset) {
    // Try local storage first if path is recorded
    if (asset.localFilePath && fs.existsSync(asset.localFilePath)) {
      return fs.readFileSync(asset.localFilePath);
    }

    // Try default local path pattern
    const defaultLocalPath = path.join(UPLOADS_DIR, `${asset.id}.${asset.mimeType === 'application/pdf' ? 'pdf' : 'jpg'}`);
    if (fs.existsSync(defaultLocalPath)) {
      return fs.readFileSync(defaultLocalPath);
    }

    // Try finding by prefix in uploads dir
    const files = fs.readdirSync(UPLOADS_DIR);
    const matched = files.find(f => f.startsWith(asset.id));
    if (matched) {
      return fs.readFileSync(path.join(UPLOADS_DIR, matched));
    }

    // If Cloudinary, fetch from signed URL
    if (this.isCloudinaryConfigured && asset.cloudinaryPublicId) {
      const isPdf = asset.mimeType === 'application/pdf';
      const signedUrl = cloudinary.utils.private_download_url(
        asset.cloudinaryPublicId,
        isPdf ? 'pdf' : 'jpg',
        {
          type: 'authenticated',
          expires_at: Math.floor(Date.now() / 1000) + 120,
          resource_type: isPdf ? 'raw' : 'image'
        }
      );
      const res = await fetch(signedUrl);
      if (!res.ok) throw new Error(`Cloudinary download returned ${res.status}`);
      const arrayBuf = await res.arrayBuffer();
      return Buffer.from(arrayBuf);
    }

    throw new Error('File not found in local disk storage or Cloudinary');
  }
}

export const storageService = new StorageService();
export default storageService;
