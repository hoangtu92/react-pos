const express = require('express')
const router = express.Router()
const { syncCustomer, searchCustomers, getPoints, instantSync} = require('../controllers/customerController')
const { verifyToken } = require('../middleware/authMiddleware')

router.get('/sync', verifyToken, syncCustomer)
router.get('/search', verifyToken, searchCustomers)
router.post('/instant-sync', verifyToken, instantSync)
router.get('/points', verifyToken, getPoints)

module.exports = router
