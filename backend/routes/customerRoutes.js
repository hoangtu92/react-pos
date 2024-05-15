const express = require('express')
const router = express.Router()
const { syncCustomer, searchCustomers, getPoints, instantSync, addOrUpdateCustomer, calcPointValue} = require('../controllers/customerController')
const { verifyToken } = require('../middleware/authMiddleware')

router.get('/sync', verifyToken, syncCustomer)
router.get('/search', verifyToken, searchCustomers)
router.post('/instant-sync', verifyToken, instantSync)
router.post('/add-update-customer', verifyToken, addOrUpdateCustomer)
router.get('/points', verifyToken, getPoints)
router.get('/calc-points', verifyToken, calcPointValue)

module.exports = router
