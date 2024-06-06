const express = require('express')
const router = express.Router()
const { syncProduct, searchProducts, countProducts, truncateProduct, getCarts, addCartItems, editCartItem,
    removeCartItem, addCartItem, getProducts
} = require('../controllers/productController')
const { verifyToken } = require('../middleware/authMiddleware')

router.get('/sync', verifyToken, syncProduct)
router.get('/search', verifyToken, searchProducts)
router.post('/get_ids', verifyToken, getProducts)
router.get('/count', verifyToken, countProducts)
router.get('/truncate', verifyToken, truncateProduct)

router.post('/cart', verifyToken, getCarts)
router.post('/addCart', verifyToken, addCartItem)
router.post('/batch', verifyToken, addCartItems)
router.post('/editCart', verifyToken, editCartItem)
router.post('/removeCartItem', verifyToken, removeCartItem)
module.exports = router
