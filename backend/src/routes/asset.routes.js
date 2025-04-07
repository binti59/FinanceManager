const express = require('express');
const router = express.Router();
const assetController = require('../controllers/asset.controller');
const authMiddleware = require('../middleware/auth.middleware');
const { validateAsset } = require('../validators/asset.validator');

// Apply authentication middleware to all routes
router.use(authMiddleware);

// Get all assets
router.get('/', assetController.getAllAssets);

// Get asset by ID
router.get('/:id', assetController.getAssetById);

// Create a new asset
router.post('/', validateAsset, assetController.createAsset);

// Update an asset
router.put('/:id', validateAsset, assetController.updateAsset);

// Delete an asset
router.delete('/:id', assetController.deleteAsset);

// Get asset allocation
router.get('/allocation', assetController.getAssetAllocation);

// Get asset performance
router.get('/performance', assetController.getAssetPerformance);

module.exports = router;
