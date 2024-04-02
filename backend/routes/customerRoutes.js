const express = require('express')
const router = express.Router()
const { syncCustomer, searchCustomers } = require('../controllers/customerController')
const { verifyToken } = require('../middleware/authMiddleware')

router.get('/sync', verifyToken, syncCustomer)
router.get('/search', verifyToken, searchCustomers)

module.exports = router
