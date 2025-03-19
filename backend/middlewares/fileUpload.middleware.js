const multer = require('multer');
const {PassThrough} = require('stream');
const path = require('path');
const httpCodes = require('../constants/httpCodes');
const httpHeaders = require('../constants/httpHeaders');
const statusMessages = require('../constants/statusMessages');
const BufferedValidationStream = require('../utils/bufferedValidationStream');
const AppError = require("../errors/app.error");

/**
 * @typedef {Object} StorageServiceConfiguration
 * @property {string[]|null} allowedMimeTypes - Array of allowed MIME types (null allows all)
 * @property {number} maxBufferSize - Maximum bytes to buffer for MIME type validation
 */

/**
 * @typedef {Object} UploadMiddlewareConfig
 * @property {number} [maxFileSize=104857600] - Maximum file size in bytes (default: 100MB)
 * @property {number} [maxFiles=1] - Maximum number of files allowed per request
 * @property {string[]|null} [allowedMimeTypes=null] - Allowed MIME types for upload validation
 * @property {number} [maxBufferSize=4096] - Buffer size for MIME type detection
 */

/**
 * Adapter class to connect Multer with cloud storage services
 * @class
 */
class StorageServiceAdapter {
    /**
     * @private
     * @type {FileStorageService}
     */
    #storageService;
    /**
     * @private
     * @type {StorageServiceConfiguration}
     */
    #config;

    /**
     * Create a StorageServiceAdapter instance
     * @constructor
     * @param {FileStorageService} storageService - Storage service implementation
     * @param {StorageServiceConfiguration} config - Validation configuration
     */
    constructor(storageService, config) {
        this.#storageService = storageService;
        this.#config = config;
    }

    /**
     * Creates a Multer-compatible storage engine
     * @returns {Object} Configured Multer storage engine
     */
    createMulterStorage() {
        return {
            _handleFile: (req, file, cb) => {
                const validationStream = new BufferedValidationStream(
                    this.#config.allowedMimeTypes,
                    this.#config.maxBufferSize
                );

                const uploadStream = new PassThrough();
                let storagePromise;
                let fileType;

                validationStream.on('validationFinish', (detectedType) => {
                    fileType = detectedType;
                    try {
                        storagePromise = this.#storageService.upload(uploadStream, {
                            mimetype: fileType.mime,
                            ext: fileType.ext,
                            owner: req.params.userId
                        }).then(storageInfo => ({
                            storageInfo,
                            fileType,
                            originalName: file.originalname
                        }));
                    } catch (err) {
                        cb(err);
                    }
                });

                validationStream.on('error', (err) => {
                    uploadStream.destroy();
                    cb(err);
                });

                uploadStream.on('error', (err) => {
                    validationStream.destroy();
                    cb(err);
                });

                uploadStream.on('finish', async () => {
                    try {
                        const {storageInfo, fileType, originalName} = await storagePromise;
                        const parsed = path.parse(originalName);
                        cb(null, {
                            name: parsed.name,
                            originalname: originalName,
                            fileId: storageInfo.fileId,
                            ext: fileType?.ext || parsed.ext.slice(1),
                            mimetype: fileType?.mime,
                            size: storageInfo.size,
                            owner: req.params.userId
                        });
                    } catch (err) {
                        cb(err);
                    }
                });

                file.stream.pipe(validationStream).pipe(uploadStream);
            },

            _removeFile: async (req, file, cb) => {
                try {
                    await this.#storageService.delete(file.fileId, req.params.userId);
                    cb(null);
                } catch (err) {
                    cb(err);
                }
            }
        };
    }
}


/**
 * Creates Express middleware for handling file uploads with all-or-nothing semantics.
 * Validates that the request contains a valid userId parameter and enforces ownership.
 *
 * @param {FileStorageService} storageService - Storage service implementation
 * @param {UploadMiddlewareConfig} [options] - Middleware configuration
 * @returns {function} Express middleware
 *
 * @throws {AppError} 400 Bad Request if:
 * - Missing userId parameter
 * - Invalid content-type header
 * - No files uploaded
 * @throws {AppError} 413 Payload Too Large if file size exceeds limit
 *
 * @example
 * // Route definition:
 * router.post('/users/:userId/files', uploadMiddleware, controller.handleUpload);
 *
 * // Successful upload response structure:
 * req.files = [
 *   {
 *     fieldname: 'file',
 *     originalname: 'document.pdf',
 *     encoding: '7bit',
 *     mimetype: 'application/pdf',
 *     name: 'document',
 *     fileId: '90a7a4f3-dbe1-4cbf-aec5-63996a370fb8',
 *     ext: 'pdf',
 *     size: 437239,
 *     owner: '67b5ffd859ffe5016346c1c9'
 *   }
 * ]
 */
function createUploadMiddleware(storageService, {
    maxFileSize = 100 * 1024 * 1024, // 100MB
    maxFiles = 1,
    allowedMimeTypes = null,
    maxBufferSize = 4096 // 4KB
} = {}) {
    const upload = multer({
        storage: new StorageServiceAdapter(storageService, {
            allowedMimeTypes,
            maxBufferSize
        }).createMulterStorage(),
        limits: {
            fileSize: maxFileSize,
            files: maxFiles
        }
    });

    return (req, res, next) => {
        if (!req.headers[httpHeaders.CONTENT_TYPE]?.includes('multipart/form-data')) {
            next(new AppError(
                statusMessages.INVALID_CONTENT_TYPE,
                httpCodes.BAD_REQUEST.code,
                httpCodes.BAD_REQUEST.name
            ));
        }

        upload.array('file')(req, res, (err) => {
            if (err) {
                console.error('Upload error:', err);

                const statusCode = err.code === 'LIMIT_FILE_SIZE'
                    ? httpCodes.PAYLOAD_TOO_LARGE.code
                    : httpCodes.BAD_REQUEST.code;

                next(new AppError(
                    err.message,
                    statusCode,
                    statusCode === httpCodes.BAD_REQUEST.code ?
                        httpCodes.BAD_REQUEST.name :
                        httpCodes.PAYLOAD_TOO_LARGE.name
                ));
                return;
            }

            if (!req.files || req.files.length === 0) {
                next(new AppError(
                    statusMessages.NO_FILES_UPLOADED,
                    httpCodes.BAD_REQUEST.code,
                    httpCodes.BAD_REQUEST.name
                ));
                return;
            }

            next();
        });
    };
}

module.exports = {createUploadMiddleware};
