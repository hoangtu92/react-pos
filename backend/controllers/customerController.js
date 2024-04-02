const Customer = require("../models/customerModel");

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

const do_sync = async (results, page = 1, cb, perpage = 100) => {

    let result = await fetch(`${process.env.JD_HOST}/wp-json/pos/v1/customer/get?page=${page}&per_page=${perpage}`, {
        method: "GET",
        headers: {
            'Authorization': "Basic " + btoa(process.env.JD_ACCOUNT),
            'Content-Type': 'application/json'
        }
    })
    if(result.ok){
        const customers = await result.json();
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

        results.push({
            created: created,
            updated: updated
        });

        if(customers.length >= perpage){
            page++;
            await do_sync(results, page, cb, perpage)
        }
        else cb(true);
    }
    else cb(false);

}

// @route /api/customer/sync
// @desc Sync customer with justdog
const syncCustomer = async(req, res) => {

    let results = [];
    await do_sync(results, 1, (status) => {
        if(status){
            res.status(200).json(results)
        }
        else {
            res.status(400)
        }
    })

}

module.exports = {
    syncCustomer,
    searchCustomers
}
