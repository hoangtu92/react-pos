const Order = require('../models/orderModel');
const Customer = require('../models/customerModel');
const Setting = require("../models/settingModel");

const WooCommerceRestApi = require("@woocommerce/woocommerce-rest-api").default;
const api = new WooCommerceRestApi({
    url: process.env.JD_HOST,
    consumerKey: process.env.JD_CK,
    consumerSecret: process.env.JD_CS,
    version: "wc/v3"
});
/**
 * @route /api/order/add-order
 * @param req
 * @param res
 * @returns {Promise<void>}
 */
const addOrder = async(req, res) => {
    const {
        clerk,
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
        customer,
        is_b2b
    } = req.body;

    const order = await Order.create({
        clerk,
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
        customer,
        is_b2b
    });
    if(order){
        const customerObj = await Customer.findOne({_id: customer});

        if(customerObj){
            let customer_points = customerObj.points - redeem_points;

            await Customer.updateOne({_id: customer}, {points: customer_points});

            /*const earn_ratio = await Setting.findOne({name: "earn_ratio"});
            if(earn_ratio){
                const total = customTotalAmount ?? totalAmount;
                customer_points += total/earn_ratio;
                await Customer.updateOne({_id: customer}, {points: customer_points});
            }*/
        }

        res.status(201).json({
            status: true,
            msg: "Add Success",
            data: order
        })
    }

    else{
        res.status(400).json({
            status: false,
            msg: "Add order failed",
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
    const {order: id} = req.params;

    const order = await Order.findOne({_id: id});
    if(order){
        const needDiscount = order.redeem_points > 0 || order.discountAmount > 0;

        let data = {
            payment_method: order.paymentMethod,
            payment_method_title: order.paymentMethod,
            set_paid: !needDiscount,
            status: needDiscount ? "pending" : "completed",
            meta_data: [
                {
                    "key": "pos_order_id",
                    "value": order._id
                }
            ],
            line_items: order.cartItems.reduce((t, e) => {

                if(e.regular_qty){
                    t.push({
                        product_id: e.parent_id ? e.parent_id : e.product_id,
                        variation_id: e.parent_id ? e.product_id : 0,
                        quantity: e.regular_qty.toString(),
                        total: ((e.price - e.discount) * e.regular_qty).toString(),
                        subtotal: ((e.price - e.discount) * e.regular_qty).toString()
                    })
                }

                if(e.discount_items){
                    e.discount_items.map(discount_item => {

                        t.push({
                            product_id: e.parent_id ? e.parent_id : e.product_id,
                            variation_id: e.parent_id ? e.product_id : 0,
                            quantity: discount_item.quantity.toString(),
                            total: discount_item.price > 0 ? ((discount_item.price - e.discount) * discount_item.quantity).toString() : "0",
                            subtotal: discount_item.price > 0 ? ((discount_item.price - e.discount) * discount_item.quantity).toString() : "0"
                        })

                    });

                }

                return t;
            }, [])
        };

        console.log(data)

        // Customer id
        const customer = await Customer.findOne({_id: order.customer});

        if(customer){
            let user_id = customer.user_id;

            const customerObj = {
                first_name: customer.name,
                last_name: customer.name,
                meta_data: [
                    {
                        key: "billing_first_name",
                        value: customer.name,
                    },
                    {
                        key: "billing_phone",
                        value: customer.phone.toString()
                    },
                    {
                        key: "smilepayei_carrier_id",
                        value: customer.carrier_id
                    },
                    {
                        key: "smilepayei_buyer_id",
                        value: customer.buyer_id
                    },
                ]
            };

            if(customer.carrier_id){
                if(!order.is_b2b){
                    data["meta_data"].push({
                        "key": "smilepayei_carrier_id",
                        "value": customer.carrier_id
                    });
                }
            }

            if(customer.buyer_id) {
                if(order.is_b2b){
                    data["meta_data"].push({
                        "key": "smilepayei_buyer_id",
                        "value": customer.buyer_id
                    });
                }
            }

            if(!user_id){
                // Find justdog customer by phone
                let result = await fetch(`${process.env.JD_HOST}/wp-json/pos/v1/customer/get-by-phone?phone=${customer.phone}`, {
                    method: "GET",
                    headers: {
                        'Authorization': "Basic " + btoa(process.env.JD_ACCOUNT),
                        'Content-Type': 'application/json'
                    }
                })
                if(result.ok) {
                    const userResult = await result.json();
                    if(userResult.data){
                        user_id = userResult.data.user_id;
                    }
                }
            }

            if(!user_id){
                // Adding new customer to justdog
                customerObj.email = `_customer_no_email_${customer.phone}@justdog.tw`
                customerObj.password = `WDH@D@D@Y@RGF#GI`
                customerObj.username = customer.phone.toString();
                try{
                    const result = await api.post("customers", customerObj);
                    if(result.status){
                        user_id = result.data.id;
                    }
                    else{
                        console.error("Could not create new user", customerObj);
                    }
                }
                catch (e){
                    console.error(e.message);
                    console.log(customerObj)
                }
            }
            else{
                // Update customer data
                await api.put("customers/" + user_id, customerObj);
            }

            if(user_id){
                if(user_id != customer.user_id) await Customer.updateOne({phone: customer.phone}, {user_id: user_id})

                data.customer_id = user_id;
            }
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
            if(order.invoice){
                data["meta_data"].push({
                    "key": "smilepayei_einvoice_no",
                    "value": order.invoice.invno
                });
            }

            if(order.invoice.rdno){
                data["meta_data"].push({
                    "key": "smilepayei_einvoice_rdno",
                    "value": order.invoice.rdno
                });
            }

            if(order.invoice.date){
                data["meta_data"].push({
                    "key": "smilepayei_einvoice_date",
                    "value": order.invoice.date
                });
            }

            if(order.invoice.time){
                data["meta_data"].push({
                    "key": "smilepayei_einvoice_time",
                    "value": order.invoice.time
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
            if(order.order_id){

                delete(data.line_items);
                delete(data.set_paid);
                delete(data.status);

                await api.put("orders/" + order.order_id, data);
            }
            else{
                const result = await api.post("orders", data);

                if(result.status === 200 || result.status === 201){
                    const order_id = result.data.id;

                    await Order.updateOne({_id: order._id}, {
                        order_id
                    })

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
            }

            res.status(201).json({
                status: true,
                msg: "Sync completed",
                data: order
            })
        } catch (e) {
            res.status(400).json({
                status: false,
                msg: "Error occurred",
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

// @route   /api/order/get-orders
// @desc    Get Orders
const getOrders = async (req, res) => {
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

module.exports = {
    addOrder,
    getOrders,
    syncOrder
}
