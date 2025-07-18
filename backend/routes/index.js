const express = require('express');
const authenticate = require('../middlewares/auth.middleware');
const {defaultRateLimiterMiddleware} = require('../middlewares/rateLimiter.middleware');
const noteRoutes = require('./note.routes');
const versionRoutes = require('./version.routes');
const authRoutes = require('./auth.routes');
const userRoutes = require('./user.routes');
const csrfRoutes = require('./csrf.routes');
const fileRoutes = require('./file.routes');
const notificationRoutes = require('./notification.routes');
const container = require("../container");

const router = express.Router();
const authenticateMiddleware = container.build(authenticate);

// routes
router.use('/auth', authRoutes);
router.use('/csrf-tokens', [defaultRateLimiterMiddleware, csrfRoutes]);
router.use('/files', [defaultRateLimiterMiddleware, fileRoutes]);
router.use('/notes', [authenticateMiddleware, defaultRateLimiterMiddleware, noteRoutes]);
router.use('/versions', [authenticateMiddleware, defaultRateLimiterMiddleware, versionRoutes]);
router.use('/users', [authenticateMiddleware, defaultRateLimiterMiddleware, userRoutes]);
router.use('/notifications', [authenticateMiddleware, defaultRateLimiterMiddleware, notificationRoutes]);

module.exports = router;
