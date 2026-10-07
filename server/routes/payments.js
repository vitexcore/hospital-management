const express = require('express');
const router = express.Router();
const { getPayments, createPayment, getRevenueStats } = require('../controllers/invoicePaymentController');
const { protect, authorize } = require('../middleware/auth');

router.use(protect);
router.get('/revenue', authorize('admin', 'super_admin'), getRevenueStats);
router.get('/', getPayments);
router.post('/', authorize('admin', 'super_admin', 'receptionist'), createPayment);

module.exports = router;
