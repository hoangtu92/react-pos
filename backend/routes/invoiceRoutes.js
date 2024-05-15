const express = require('express')
const router = express.Router()
const { verifyToken } = require('../middleware/authMiddleware')
const {viewInvoice, issueInvoice, validate_carrier_id} = require("../controllers/invoiceController");

router.get('/view/:id', verifyToken, viewInvoice)
router.post('/issue', verifyToken, issueInvoice)
router.post('/validate-carrier-id', verifyToken, validate_carrier_id)

module.exports = router
