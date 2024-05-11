require('dotenv').config()
const connectDatabase = require('../config/database')

// DATABASE CONNECT
connectDatabase()

const do_sync_product = require("../controllers/productController").do_sync;
const do_sync_customer = require("../controllers/customerController").do_sync;

(async function () {
    await do_sync_product(1, 20, 0, 0, result => {
        //console.log(result)
        console.log(result.total + " Product synced")
    });

    await do_sync_customer(1, -1, 0, result => {
        //console.log(result)
        console.log(result.total + " Customer synced")
    });

    process.exit(0);
})();


