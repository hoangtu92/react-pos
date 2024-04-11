const express = require('express')
const router = express.Router()
const { verifyToken } = require('../middleware/authMiddleware')
const {calcCouponValue} = require("../controllers/couponController");


router.post('/calc', verifyToken, calcCouponValue)

module.exports = router
