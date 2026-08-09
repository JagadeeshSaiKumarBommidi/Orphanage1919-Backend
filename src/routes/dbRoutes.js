const express = require('express');
const router = express.Router();
const dbController = require('../controllers/dbController');
const authMiddleware = require('../middleware/authMiddleware');

router.post('/query', (req, res, next) => {
  const { method, table } = req.body;
  if (method === 'select') {
    return next();
  }
  if (method === 'insert' && (table === 'subscribers' || table === 'donations')) {
    return next();
  }
  authMiddleware(req, res, next);
}, dbController.handleQuery);

router.post('/assign-receipt-no', dbController.assignReceiptNo);

module.exports = router;
