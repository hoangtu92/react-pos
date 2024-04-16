const express = require('express')
const router = express.Router()
const { syncProduct, searchProducts, countProducts} = require('../controllers/productController')
const { verifyToken } = require('../middleware/authMiddleware')

router.get('/sync', verifyToken, syncProduct)
router.get('/search', verifyToken, searchProducts)
router.get('/count', verifyToken, countProducts)

module.exports = router
