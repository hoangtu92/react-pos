const express = require('express')
const router = express.Router()
const { verifyToken } = require('../middleware/authMiddleware')
const {calculate_discount, syncDiscountSettings} = require("../controllers/discountController");

router.post('/calc-discount', verifyToken, calculate_discount)
router.get('/sync-discounts', verifyToken, syncDiscountSettings)


module.exports = router
