require('dotenv').config()
const connectDatabase = require('../config/database')

// DATABASE CONNECT
connectDatabase()

const do_sync_product = require("../controllers/productController").do_sync;
const do_sync_customer = require("../controllers/customerController").do_sync;
const do_sync_settings = require("../controllers/DiscountController").do_sync_settings;
const do_sync_discounts = require("../controllers/DiscountController").do_sync_discounts;

(async function () {
    await do_sync_product(1, 20, 0, 0, result => {
        //console.log(result)
        console.log(result.total + " Product synced")
    });

    await do_sync_customer(1, -1, 0, result => {
        //console.log(result)
        console.log(result.total + " Customer synced")
    });

    await do_sync_settings(result => {
        console.log("Setting synced")
    });

    await do_sync_discounts(data => {
        if (data) {
            console.log(data.length + " Discounts synced")
        }
    });


    //process.exit(0);
})();


