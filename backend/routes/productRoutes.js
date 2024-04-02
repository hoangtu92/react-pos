const express = require('express')
const router = express.Router()
const { syncProduct, searchProducts } = require('../controllers/productController')
const { verifyToken } = require('../middleware/authMiddleware')

router.get('/sync', verifyToken, syncProduct)
router.get('/search', verifyToken, searchProducts)

module.exports = router
