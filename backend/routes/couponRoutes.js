const express = require('express')
const router = express.Router()
const { verifyToken } = require('../middleware/authMiddleware')
const {pointRedeem} = require("../controllers/couponController");

router.post('/redeem', verifyToken, pointRedeem)
module.exports = router
