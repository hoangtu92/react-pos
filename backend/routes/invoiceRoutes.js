const express = require('express')
const router = express.Router()
const { verifyToken } = require('../middleware/authMiddleware')
const {viewInvoice, issueInvoice} = require("../controllers/invoiceController");

router.get('/view/:order_id', verifyToken, viewInvoice)
router.post('/issue', verifyToken, issueInvoice)

module.exports = router
