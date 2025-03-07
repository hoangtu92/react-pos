const express = require('express')
const router = express.Router()
const { addOrder, getOrders, syncOrder, calcMaxUsagePoint} = require('../controllers/orderController')
const { verifyToken } = require('../middleware/authMiddleware')

router.post('/add-order', verifyToken, addOrder)
router.post('/sync/:order', verifyToken, syncOrder)
router.get('/get-orders', verifyToken, getOrders)
router.get('/get-max-usage-point', verifyToken, calcMaxUsagePoint)

module.exports = router
