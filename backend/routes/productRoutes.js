const express = require('express')
const router = express.Router()
const { syncProduct, getAllProducts } = require('../controllers/productController')
const { verifyToken } = require('../middleware/authMiddleware')

router.get('/sync', verifyToken, syncProduct)
router.get('/all-products', verifyToken, getAllProducts)

module.exports = router