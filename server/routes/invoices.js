const express = require('express');
const router = express.Router();
const { getInvoices, getInvoice, createInvoice, updateInvoice } = require('../controllers/invoicePaymentController');
const { protect, authorize } = require('../middleware/auth');

router.use(protect);
router.get('/', getInvoices);
router.post('/', authorize('admin', 'super_admin', 'receptionist'), createInvoice);
router.get('/:id', getInvoice);
router.put('/:id', authorize('admin', 'super_admin', 'receptionist'), updateInvoice);

module.exports = router;
