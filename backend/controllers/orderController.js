const Order = require('../models/orderModel');
const WooCommerceRestApi = require("@woocommerce/woocommerce-rest-api").default;
const api = new WooCommerceRestApi({
    url: process.env.JD_HOST,
    consumerKey: process.env.JD_CK,
    consumerSecret: process.env.JD_CS,
    version: "wc/v3"
});
// @route   /api/order/add-order
// @desc    Add Order
const addOrder = async (req, res) => {

    const {
        customer,
        customer_id,
        cartItems,
        subTotal,
        totalAmount,
        discountAmount,
        redeemAmount,
        paymentMethod,
        orderType,
        clerk
    } = req.body

    if (!cartItems || cartItems.length < 1) {
        console.log('No cart items')
    }

    const lineItems = cartItems.map((e) => {
        return {sku: e.sku, quantity: e.quantity}
    })

    const data = {
        customer_id: customer_id,
        payment_method: paymentMethod,
        payment_method_title: paymentMethod,
        set_paid: false,
        line_items: lineItems,
        /*meta_data: [
            {
                "key": "shopee_order_sn",
                "value": 0
            },
            {
                "key": "smilepayei_custom_amount",
                "value": 0
            }
        ],*/
    };

    const result = await api.post("orders", data);


    if(result.status === 200 || result.status === 201){
        const order = await Order.create({
            order_id: result.data.id,
            customer,
            clerk,
            cartItems,
            subTotal,
            totalAmount,
            paymentMethod,
            orderType,
            discountAmount,
            redeemAmount
        })
        res.status(result.status).json(order)
    }

    else res.status(result.status).json(result.data)


}

// @route   /api/order/get-orders
// @desc    Get Orders
const getOrders = async (req, res) => {
    const orders = await Order.find({})
    res.status(201).json(orders)
}

/**
 * @route /api/order/invoice/issue
 * @description Issue invoice
 * @param req
 * @param res
 * @returns {Promise<void>}
 */
const issueInvoice = async(req, res) => {
    const {order_id} = req.body;

    const order = await Order.findOne({order_id: order_id});
    if(order){

    }
}

/**
 * @route /api/order/invoice/view
 * @description View invoice for printing
 * @param req
 * @param res
 * @returns {Promise<void>}
 */
const viewInvoice = async(req, res) => {

}

// @route   /api/order/delete
// @desc    Delete Order
const removeOrder = async (req, res) => {
    const {order: orderId} = req.params;

    const result = await api.delete("orders/"+orderId, {
        force: true
    })

    if(result.status === 200){
        const order = await Order.findOne({order_id: orderId}, {user: 1})

        if (!order) {
            res.status(400)
            throw new Error('Order not found')
        }

        await order.deleteOne();
        return res.status(200).json(result.data)
    }


    res.status(result.status).json(result.data)
}

module.exports = {
    addOrder,
    getOrders,
    removeOrder
}
