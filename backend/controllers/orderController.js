const Order = require('../models/orderModel');
const Customer = require('../models/customerModel');

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
        paymentMethod,
        orderType,
        clerk
    } = req.body

    const data = {
        customer_id: customer_id,
        payment_method: paymentMethod,
        payment_method_title: paymentMethod,
        set_paid: false,
    };

    const result = await api.post("orders", data);


    if(result.status === 200 || result.status === 201){
        const order = await Order.create({
            order_id: result.data.id,
            customer,
            clerk,
            paymentMethod,
            orderType,
        })
        res.status(result.status).json(order)
    }

    else res.status(result.status).json(result.data)

}
/**
 * @route /api/order/add-customer
 * @param req
 * @param res
 * @returns {Promise<void>}
 */
const addCustomer = async (req, res) => {
    const {order_id, customer_id} = req.body;
    if(order_id && customer_id){
        const result = await api.put("orders/" + order_id, {customer_id});
        res.status(201).json({
            status: true,
            data: result.data,
            msg: "Success"
        })
    }
    else res.status(400).json({
        status: false,
        data: {order_id, customer_id},
        msg: "Invalid request"
    })
}
/**
 * @route /api/order/validate-carrier-id
 * @param req
 * @param res
 * @returns {Promise<void>}
 */
const validateCarrierId = async (req, res) => {
    const {carrier_id} = req.body;
    if(carrier_id){
        let formData = new FormData();
        formData.append("action", "smilepayei_check_carrier_id");
        formData.append("type", "3J0002");
        formData.append("carrier_id", carrier_id);

        const result = await fetch(process.env.JD_HOST + '/?wc-ajax=smilepayei_check_carrier_id', {
                method: "POST",
                body: formData
            },
        );

        if(result.ok) {
            const data = await result.json();
            if(data.Status === "0"){
                res.status(201).json({
                    status: true,
                    msg: data.Desc,
                    data: data
                })
            }
            else{
                res.status(400).json({
                    status: false,
                    msg: data.Desc,
                    data: data
                })
            }

        }
        else{
            res.status(400).json({
                status: false,
                msg: "Something wrong"
            })
        }
    }
    else res.status(400).json({
        status: false,
        msg: "Invalid carrier Id"
    })
}

// @route   /api/order/get-orders
// @desc    Get Orders
const getOrders = async (req, res) => {
    //const orders = await Order.find({}).sort({createdAt: 'desc'})
    const orders = await Order.aggregate([{
        $lookup: {
            from: "users",
            localField: "clerk",
            foreignField: "_id",
            as: "clerks"
        }
    }]).sort({createdAt: 'desc'});

    res.status(201).json(orders)
}


/**
 * @route /api/order/get/:order_id
 * @description View invoice for printing
 * @param req
 * @param res
 * @returns {Promise<void>}
 */
const getOrder = async(req, res) => {
    const {order: orderId} = req.params;
    const order = await Order.findOne({order_id: orderId});

    try{
        const result = await api.get("orders/" + orderId);

        if(result.status){
            res.status(201).json({
                status: true,
                order: order,
                jd_order: result.data
            })
        }
        else{
            res.status(400).json({
                order: order,
                status: false,
                msg: "Error occurred"
            })
        }
    }
    catch(e){
        res.status(400).json({
            status: false,
            order: order,
            msg: "Error occurred"
        })
    }

}

/**
 * @route /api/order/apply-discount
 * @param req
 * @param res
 * @returns {Promise<void>}
 */
const applyDiscount = async (req, res) => {
    const {
        order_id,
        discountValue,
        discountType,
        discountTarget
    } = req.body;

    const order = await Order.findOne({order_id: order_id});

    if(order && discountValue){
        let discountAmount;
        if(discountType === 'percent'){
            if(discountTarget === 'product'){
                discountAmount = order.cartItems.reduce((t, e) => {
                    t += (e.price*e.quantity*discountValue)/100;
                    return t;
                }, 0);
            }
            else{
                discountAmount = (order.totalAmount*discountValue)/100;
            }
        }
        else{
            if(discountTarget === 'product'){
                discountAmount = order.cartItems.reduce((t, e) => {
                    t += discountValue
                    return t;
                }, 0);
            }
            else{
                discountAmount = discountValue;
            }
        }

        if(discountAmount > 0){
            const totalAmount = order.totalAmount - discountAmount;

            await Order.findOneAndUpdate({order_id: order_id}, {
                discountAmount: Math.round(discountAmount),
                totalAmount: Math.round(totalAmount)
            });
        }


        res.status(201).json({
            status: true,
            msg: "Apply discount success"
        })
    }


    else
        res.status(400).json({
            status: false,
            msg: "Apply discount failed"
        })
}

/**
 * @route /api/order/update-order
 * @param req
 * @param res
 * @returns {Promise<void>}
 */
const updateOrder = async(req, res) => {
    const {
        order_id,
        cartItems,
        invoice,
        customTotalAmount,
        subTotal,
        totalAmount,
        redeemAmount,
        discountAmount,
        paymentMethod,
        orderType,
        carrier_id,
        buyer_id,
        redeem_points,
        customer
    } = req.body;

    const order =  await Order.findOne({order_id: order_id});
    if(order){
        const result = await Order.updateOne({order_id: order_id}, {
            cartItems,
            invoice,
            customTotalAmount,
            subTotal,
            totalAmount,
            redeemAmount,
            discountAmount,
            paymentMethod,
            orderType,
            carrier_id,
            buyer_id,
            redeem_points,
            customer
        });


        res.status(201).json({
            status: true,
            msg: "Update Success",
            data: result
        })
    }

    else{
        res.status(403).json({
            status: true,
            msg: "Not found",
        })
    }
}

/**
 * @route /api/order/sync
 * @param req
 * @param res
 * @returns {Promise<void>}
 */
const syncOrder = async(req, res) => {
    const {order: order_id} = req.params;

    const order = await Order.findOne({order_id: order_id});
    if(order){
        const needDiscount = order.redeem_points > 0 || order.discountAmount > 0;

        let data = {
            payment_method: order.paymentMethod,
            payment_method_title: order.paymentMethod,
            set_paid: !needDiscount,
            status: needDiscount ? "pending" : "completed",
            meta_data: [],
            /*line_items: order.cartItems.map(e => {
                return {
                    sku: e.sku,
                    quantity: e.quantity.toString(),
                    total: (e.price * e.quantity).toString()
                }
            })*/
        };


        // Use for update exists order
        // Line items
        const result = await api.get("orders/" + order_id);

        if(result.status === 200 || result.status === 201){

            if(result.data.line_items.length === 0){

                data.line_items = order.cartItems.map(e => {
                    return {
                        sku: e.sku,
                        quantity: e.quantity.toString(),
                        total: (e.price * e.quantity).toString()
                    }
                });

                /*const update_line_items = order.cartItems.reduce((t, e) => {
                    t[e.sku] = e;
                    return t;
                }, []);


                data.line_items = result.data.line_items.map(e => {
                    let qty = typeof update_line_items[e.sku] !== 'undefined' ? update_line_items[e.sku].quantity : 0;
                    let price = typeof update_line_items[e.sku] !== 'undefined' ? update_line_items[e.sku].price : e.price;
                    return {
                        sku: e.sku,
                        id: e.id,
                        quantity: qty.toString(),
                        total: (price*qty).toString()
                    }
                });*/

                /*if(data.line_items.length === 0){
                    data.line_items = order.cartItems.map(e => {
                        return {
                            sku: e.sku,
                            quantity: e.quantity.toString(),
                            //subtotal: (e.quantity*e.price).toString(),
                            total: (e.quantity*e.price).toString()
                        }
                    });
                }*/
            }
        }

        // Customer id
        const customer = await Customer.findOne({_id: order.customer});
        if(customer){
            data.customer_id = customer.user_id;
        }

        // Custom amount
        if(order.customTotalAmount > 0){
            data["meta_data"].push({
                "key": "smilepayei_custom_amount",
                "value": order.customTotalAmount
            });
        }

        // Meta
        if(typeof order.invoice !== "undefined"){
            if(typeof order.invoice.invno !== "undefined" && order.invoice.invno.length === 10){
                data["meta_data"].push({
                    "key": "smilepayei_einvoice_no",
                    "value": order.invoice.invno
                });
            }

            if(typeof order.invoice.rdno !== "undefined" && order.invoice.rdno.length > 0){
                data["meta_data"].push({
                    "key": "smilepayei_einvoice_rdno",
                    "value": order.invoice.rdno
                });
            }

            if(typeof order.invoice.date !== "undefined" && order.invoice.date.length > 0){
                data["meta_data"].push({
                    "key": "smilepayei_einvoice_date",
                    "value": order.invoice.date
                });
            }

            if(typeof order.invoice.time !== "undefined" && order.invoice.time.length > 0){
                data["meta_data"].push({
                    "key": "smilepayei_einvoice_time",
                    "value": order.invoice.time
                });
            }

            if(typeof order.invoice.buyer_id !== "undefined" && order.invoice.buyer_id !== null){
                data["meta_data"].push({
                    "key": "smilepayei_buyer_id",
                    "value": order.invoice.buyer_id
                });
            } else if(typeof order.invoice.carrier_id !== "undefined" && order.invoice.carrier_id !== null){
                data["meta_data"].push({
                    "key": "smilepayei_carrier_id",
                    "value": order.invoice.carrier_id
                });
            }
        }

        if(order.orderType === "ubereat"){
            data["meta_data"].push({
                "key": "_billing_first_name",
                "value": "ubereat"
            });
        }

        //console.log(data);
        try {
            const result = await api.put("orders/" + order_id, data);

            if(result.status === 200 || result.status === 201){
                // Todo redeem

                if(needDiscount){
                    if(order.redeem_points > 0){
                        await fetch(`${process.env.JD_HOST}/wp-json/pos/v1/points/redeem`, {
                            method: "POST",
                            headers: {
                                'Authorization': "Basic " + btoa(process.env.JD_ACCOUNT),
                                'Content-Type': 'application/json'
                            },
                            body: JSON.stringify({
                                order_id: order_id,
                                points: order.redeem_points
                            })
                        });
                    }

                    // Todo discount
                    if(order.discountAmount > 0){
                        await fetch(`${process.env.JD_HOST}/wp-json/pos/v1/discount/apply`, {
                            method: "POST",
                            headers: {
                                'Authorization': "Basic " + btoa(process.env.JD_ACCOUNT),
                                'Content-Type': 'application/json'
                            },
                            body: JSON.stringify({
                                order_id: order_id,
                                discount_value: order.discountAmount
                            })
                        });
                    }


                    // Complete the order
                    await api.put("orders/" + order_id, {
                        status: "completed"
                    });
                }


            }

            res.status(201).json({
                status: true,
                msg: "Sync completed",
                data: order
            })
        } catch (e) {
            console.log(e);
            res.status(400).json({
                status: false,
                msg: "Error occured",
                data: e
            })
        }
    } else{
        res.status(403).json({
            status: false,
            msg: "order not found"
        })
    }

}

// @route   /api/order/delete
// @desc    Delete Order
const removeOrder = async (req, res) => {
    const {order: orderId} = req.params;

    try{
        const result = await api.delete("orders/"+orderId, {
            force: true
        })

        if(result.status === 200){
            const order = await Order.findOne({order_id: orderId}, {user: 1})

            if (!order) {
                res.status(200).json({
                    status: false,
                    msg: "Order not found"
                })
            }
            else{
                await order.deleteOne();
            }

            return res.status(200).json(result.data)
        }

        res.status(result.status).json(result.data)
    }
    catch (e) {
        res.status(200).json({
            status: false,
            msg: "Error occured",
        })
    }




}

module.exports = {
    addOrder,
    getOrders,
    removeOrder,
    applyDiscount,
    updateOrder,
    getOrder,
    syncOrder,
    addCustomer,
    validateCarrierId
}
