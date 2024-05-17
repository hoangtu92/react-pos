const express = require('express')
const router = express.Router()
const { verifyToken } = require('../middleware/authMiddleware')
const {calculate_discount} = require("../controllers/discountController");

router.post('/calc-discount', verifyToken, calculate_discount)



module.exports = router
