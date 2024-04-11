const express = require('express')
const router = express.Router()
const { addOrder, getOrders, removeOrder, updateOrder, getOrder, syncOrder, addCustomer, validateCarrierId} = require('../controllers/orderController')
const { verifyToken } = require('../middleware/authMiddleware')

router.post('/add-order', verifyToken, addOrder)
router.get('/get/:order', verifyToken, getOrder)
router.post('/sync/:order', verifyToken, syncOrder)
router.post('/update-order', verifyToken, updateOrder)
router.post('/add-customer', verifyToken, addCustomer)
router.get('/get-orders', verifyToken, getOrders)
router.delete('/delete/:order', verifyToken, removeOrder)
router.post('/validate-carrier-id', verifyToken, validateCarrierId)

module.exports = router
