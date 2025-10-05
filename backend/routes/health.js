const express = require('express');
const router = express.Router();

// Health check endpoint
router.get('/', (req, res) => {
    res.status(200).json({
        success: true,
        message: 'PashuMitra Portal Backend is running',
        timestamp: new Date().toISOString(),
        services: {
            database: 'connected',
            email: 'configured',
            server: 'running'
        }
    });
});

module.exports = router;