const express = require('express');
const router = express.Router();
const allocationController = require('../controllers/allocationController');
const { validateAllocationRequest } = require('../middleware/validationMiddleware');

router.post('/allocate', validateAllocationRequest, allocationController.postAllocation);

module.exports = router;