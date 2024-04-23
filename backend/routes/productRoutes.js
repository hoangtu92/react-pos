const express = require('express')
const router = express.Router()
const { syncProduct, searchProducts, countProducts, truncateProduct} = require('../controllers/productController')
const { verifyToken } = require('../middleware/authMiddleware')

router.get('/sync', verifyToken, syncProduct)
router.get('/search', verifyToken, searchProducts)
router.get('/count', verifyToken, countProducts)
router.get('/truncate', verifyToken, truncateProduct)

module.exports = router
