const AppError = require('../errors/app.error');
const httpCodes = require('../constants/httpCodes');
const statusMessages = require("../constants/statusMessages");
const resources = require("../enums/resources.enum");

/**
 * Controller for user-related operations.
 */
class UserController {
    /**
     * @private
     * @type {UserService}
     * @description The user service instance for handling user-related operations.
     */
    #userService;
    /**
     * @private
     * @type {PermissionService}
     * @description The user service instance for handling permission-related operations.
     */
    #permissionService;
    /**
     * @private
     * @type {VersionService}
     * @description The user service instance for handling version-related operations.
     */
    #versionService;

    /**
     * Constructs a new UserController.
     * @param depndencies
     * @param {UserService} depndencies.userService - The user service instance.
     * @param {PermissionService} depndencies.permissionService - The permission service instance.
     * @param {VersionService} depndencies.versionService - The version service instance.
     * */
    constructor({userService, permissionService, versionService}) {
        this.#userService = userService;
        this.#permissionService = permissionService;
        this.#versionService = versionService;
    }

    /**
     * Retrieves a user by ID or Email.
     *
     * @param {import('express').Request} req - The Express request object.
     * @param {import('express').Response} res - The Express response object.
     * @param {Function} next - The Express next middleware function.
     * @returns {Promise<void>} A promise that resolves when the response is sent.
     * @throws {AppError} If the user is not found.
     */
    async getUser(req, res, next) {
        const {email, id} = req.query;

        const user = id ?
            await this.#userService.findById(id) :
            await this.#userService.findByEmail(email);

        if (!user) {
            next(new AppError(
                statusMessages.USER_NOT_FOUND,
                httpCodes.NOT_FOUND.code,
                httpCodes.NOT_FOUND.name
            ));
        }

        res.status(httpCodes.OK.code).json({
            id: user?.id,
            email: user?.email,
            firstname: user?.firstname,
            lastname: user?.lastname,
            avatarUrl: user?.avatarUrl
        });
    }

    /**
     * Uploads a user's avatar.
     *
     * @param {FileUploadRequest} req - The Express request object.
     * @param {import('express').Response} res - The Express response object.
     * @param {Function} next - The Express next middleware function.
     * @returns {Promise<void>} A promise that resolves when the response is sent.
     */
    async uploadUserAvatar(req, res, next) {
        const {userId} = req.params;
        if (!req.files[0]) {
            next(new AppError(
                statusMessages.NO_AVATAR_UPLOADED,
                httpCodes.BAD_REQUEST.code,
                httpCodes.BAD_REQUEST.name
            ));
            return;
        }

        const updatedUser = await this.#userService.updateAvatar(userId, req.files[0].fileId);
        if (!updatedUser) {
            next(new AppError(
                statusMessages.USER_NOT_FOUND,
                httpCodes.NOT_FOUND.code,
                httpCodes.NOT_FOUND.name
            ));
        }

        req.updatedUser = updatedUser;
        res.status(httpCodes.CREATED.code).json({avatarUrl: updatedUser.avatarUrl});
    }

    /**
     * Gets all permissions granted by a specific user.
     * @param {import('express').Request} req - Express request object.
     * @param {string} req.params.userId - ID of the user who granted permissions.
     * @param {Object} req.body - Pagination options.
     * @param {number} [req.body.page=0] - Page number.
     * @param {number} [req.body.limit=10] - Items per page.
     * @param {import('express').Response} res - Express response object.
     * @returns {Promise<void>}
     */
    async getPermissionsGrantedByUser(req, res) {
        const {userId} = req.params;
        const {page = 0, limit = 10, resource} = req.query;

        const permissions = await this.#permissionService.getPermissionsGrantedByUser(
            userId,
            resource,
            {page, limit}
        );

        res.status(httpCodes.OK.code).json(permissions);
    }

    /**
     * Updates permission for a specific user on a note.
     * @param {import('express').Request} req - Express request object.
     * @param {string} req.params.noteId - ID of the note.
     * @param {string} req.params.userId - ID of the user whose permission to update.
     * @param {Object} req.body - Permission data.
     * @param {string} req.body.role - New permission role.
     * @param {import('express').Response} res - Express response object.
     * @returns {Promise<void>}
     * @throws {AppError} If a permission isn't found (404).
     */
    async revokePermission(req, res) {
        const {userId} = req.params;
        const {noteId} = req.query;

        const isDeleted = await this.#permissionService.revokePermission({
            resourceType: resources.NOTE,
            resourceId: noteId,
            userId
        });

        if (!isDeleted) {
            throw new AppError(
                statusMessages.PERMISSION_NOT_FOUND,
                httpCodes.NOT_FOUND.code,
                httpCodes.NOT_FOUND.name
            );
        }

        res.status(httpCodes.OK.code).json({message: `Revoked permission successfully`});
    }

    async updatePermission(req, res) {
        const {userId} = req.params;
        const {role, noteId} = req.body;

        const updatedPermission = await this.#permissionService.updatePermissions({
            userId,
            resourceType: resources.NOTE,
            resourceId: noteId,
        }, {role});

        if (!updatedPermission) {
            throw new AppError(
                statusMessages.PERMISSION_NOT_FOUND,
                httpCodes.NOT_FOUND.code,
                httpCodes.NOT_FOUND.name
            );
        }

        res.status(httpCodes.OK.code).json({
            id: updatedPermission.id,
            userId: updatedPermission.userId,
            role: updatedPermission.role
        });
    }

    /**
     * Gets permission for a specific user on a note.
     * @param {import('express').Request} req - Express request object.
     * @param {string} req.params.noteId - ID of the note.
     * @param {string} req.params.userId - ID of the user whose permission to get.
     * @param {import('express').Response} res - Express response object.
     * @returns {Promise<void>}
     * @throws {AppError} If permission not found (404).
     */
    async getUserPermission(req, res) {
        const {userId} = req.params;
        const {noteId} = req.query;

        const permission = await this.#permissionService.getUserPermission({
            userId,
            resourceType: resources.NOTE,
            resourceId: noteId
        });

        if (!permission) {
            throw new AppError(
                statusMessages.PERMISSION_NOT_FOUND,
                httpCodes.NOT_FOUND.code,
                httpCodes.NOT_FOUND.name
            );
        }

        res.status(httpCodes.OK.code).json(permission);
    }

    /**
     * Get user commits for a specific note
     */
    async getUserCommits(req, res) {
        const {userId} = req.params;
        const {noteId, page = 0, limit = 10} = req.query;

        const commits = await this.#versionService.getUserCommitsForNote(
            {userId, noteId},
            {page, limit}
        );

        res.status(httpCodes.OK.code).json(commits);
    }
}

module.exports = UserController;
