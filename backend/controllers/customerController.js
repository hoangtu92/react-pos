const Customer = require("../models/customerModel");

const WooCommerceRestApi = require("@woocommerce/woocommerce-rest-api").default;
const api = new WooCommerceRestApi({
    url: process.env.JD_HOST,
    consumerKey: process.env.JD_CK,
    consumerSecret: process.env.JD_CS,
    version: "wc/v3"
});

// @route   /api/customer/search
// @desc    All Customer
const searchCustomers = async (req, res) => {
    const { query } = req.query;

    let customers;
    if(typeof query === undefined || query === ""){
        customers = await Customer.find({}, null,  { limit: 10, skip: 0 });
    }
    else{
        let reg = new RegExp(query);
        customers = await Customer.find({$or: [{phone: query}, {name: reg}]}, null,  { limit: 10, skip: 0 })
    }

    res.status(201).json(customers)
}

const do_sync = async (page = 1, perpage=20, count, cb) => {

    let result = await fetch(`${process.env.JD_HOST}/wp-json/pos/v1/customer/get?page=${page}&per_page=${perpage}&count=${count}`, {
        method: "GET",
        headers: {
            'Authorization': "Basic " + btoa(process.env.JD_ACCOUNT),
            'Content-Type': 'application/json'
        }
    })
    if(result.ok){
        const customers = await result.json();

        if(count > 0){
            cb({
                total: customers.total_customers
            });
        }
        else{
            let created = [], updated = [];

            for(let i=0; i< customers.length; i++){

                let {phone, name , avatar, user_id, email, buyer_id, carrier_id, points} = customers[i];

                if(phone){
                    const exists = await Customer.findOne({"phone": phone});
                    if(!exists){
                        const customer = await Customer.create({
                            user_id,
                            avatar,
                            name,
                            phone,
                            email,
                            buyer_id,
                            carrier_id,
                            points
                        });
                        created.push(customer)
                    }
                    else{
                        await Customer.updateOne({"phone": phone},{
                            user_id,
                            avatar,
                            name,
                            phone,
                            email,
                            buyer_id,
                            carrier_id,
                            points
                        });
                        updated.push(customers[i]);
                    }
                }
            }
            cb({
                created: created,
                updated: updated,
                page: page,
                total: created.length + updated.length
            });
        }


    }
    else cb(false);

}

// @route /api/customer/sync
// @desc Sync customer with justdog
const syncCustomer = async(req, res) => {
    const { page, count } = req.query;
    await do_sync(page, 10, count, (results) => {
        if(results){
            res.status(200).json(results)
        }
        else {
            res.status(400)
        }
    })

}

/**
 * SYnc customer info between POS and justdog (create of none exists)
 * @route /api/customer/instant-sync
 * @param req
 * @param res
 * @returns {Promise<void>}
 */
const instantSync = async(req, res) => {

    let {name, phone, user_id, carrier_id, buyer_id} = req.body;


    const customer = {
        first_name: name,
        last_name: name,
        meta_data: [
            {
                key: "billing_first_name",
                value: name,
            },
            {
                key: "billing_phone",
                value: phone.toString()
            }
        ]
    };

    if(carrier_id) customer.meta_data.push({
        key: "smilepayei_carrier_id",
        value: carrier_id
    })

    if(buyer_id) customer.meta_data.push({
        key: "smilepayei_buyer_id",
        value: buyer_id
    });

    if(!user_id){
        let result = await fetch(`${process.env.JD_HOST}/wp-json/pos/v1/customer/get-by-phone?phone=${phone}`, {
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

    if(user_id){
        try {
            const result = await api.put("customers/" + user_id, customer);

            if(result.status === 200 || result.status === 201){
                res.status(200).json({
                    status: true,
                    data: result.data,
                    msg: "Update user success"
                })
            }
        }
        catch (e){
            res.status(400).json({
                status: false,
                msg: e.message,
                data: customer
            });
        }
    }
    else{
        customer.email = `_customer_no_email_${phone}@justdog.tw`
        customer.password = `123456`
        customer.username = phone.toString();
        try{
            const result = await api.post("customers", customer);

            if(result.status){
                res.status(201).json({
                    status: true,
                    data: result.data,
                    msg: "New user created!"
                })

            }
            else{
                res.status(400).json({
                    status: false,
                    data: result.data,
                    msg: "Could not create new user"
                });
            }
        }
        catch (e){
            res.status(400).json({
                status: false,
                msg: e.message,
                data: customer
            });
        }
    }

    await Customer.updateOne({phone: phone}, {
        name, phone, user_id, carrier_id, buyer_id
    }, {upsert: true});


}



/**
 * @route /api/customer/points
 * @param req
 * @param res
 * @returns {Promise<void>}
 */
const getPoints = async (req, res) => {
    const {customer_id} = req.query;
    const result = await fetch(`${process.env.JD_HOST}/wp-json/pos/v1/coupon/points?customer_id=${customer_id}`, {
        method: "GET",
        headers: {
            'Authorization': "Basic " + btoa(process.env.JD_ACCOUNT),
            'Content-Type': 'application/json'
        }
    });
    if(result.ok) {
        const data = await result.json();
        if(data.status){
            await Customer.updateOne({user_id: customer_id}, {points: data.points})
            res.status(201).json(data);
        }
        else{
            res.status(403).json(data);
        }
    }
    else{
        res.status(400).json({
            status: false,
            msg: result.statusText
        })
    }

}


module.exports = {
    syncCustomer,
    searchCustomers,
    instantSync,
    getPoints,
    do_sync
}
