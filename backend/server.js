const express = require('express')
const dotenv = require('dotenv').config()
const connectDatabase = require('./config/database')
const { errorHandler} = require('./middleware/errorMiddleware')
const authRoutes = require('./routes/authRoutes')
const productRoutes = require('./routes/productRoutes')
const orderRoutes = require('./routes/orderRoutes')
const couponRoutes = require('./routes/couponRoutes')
const customerRoutes = require('./routes/customerRoutes')
const invoiceRoutes = require('./routes/invoiceRoutes')
const cookieParser = require('cookie-parser')
const cors = require('cors')


// DATABASE CONNECT
connectDatabase()

const app = express()

const corsOrigin = {
    origin: [
        'http://localhost:3000',
        'http://localhost',
    ],
    credentials:true,
}
app.use(cors(corsOrigin))
app.use(cookieParser())
app.use(express.json())
app.use(express.urlencoded({ extended: false }))
// set the view engine to ejs
const path = require("path");
app.set("views", path.join(__dirname, "views"));

app.set('view engine', 'ejs');

// ROUTES
app.get('/', (req, res) => {
    res.send('Welcome')
});

app.use('/api/invoice', invoiceRoutes)
app.use('/api/auth', authRoutes)
app.use('/api/product', productRoutes)
app.use('/api/order', orderRoutes)
app.use('/api/coupon', couponRoutes)
app.use('/api/customer', customerRoutes)

// Middleware
app.use(errorHandler)

// SERVER SETUP
const PORT = process.env.PORT || 8000
app.listen(PORT, () => console.log(`server on port ${PORT}`))
