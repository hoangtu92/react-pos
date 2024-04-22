const Product = require('../models/productModel');

/**
 * @route /api/product/search
 * @param req
 * @param res
 * @returns {Promise<void>}
 */
const searchProducts = async (req, res) => {
    const { query } = req.query;

    let products;
    if(typeof query == 'undefined' || query === ""){
        products = await Product.find({}, null,  { limit: 10, skip: 0 });
    }
    else{
        const reg = new RegExp(query.replace(/\W/, ""), 'i');
        products = await Product.find({$or: [{sku: new RegExp(query, "i")}, {barcode: new RegExp(query, "i")}, {name: reg}]}, null,  { limit: 12, skip: 0 })
    }

    res.status(201).json(products)
}

/**
 * @route /api/product/count
 * @param req
 * @param res
 * @returns {Promise<void>}
 */
const countProducts = async (req, res) => {
    let result = await fetch(`${process.env.JD_HOST}/wp-json/pos/v1/product/count`, {
        method: "GET",
        headers: {
            'Authorization': "Basic " + btoa(process.env.JD_ACCOUNT),
            'Content-Type': 'application/json'
        }
    })
    if(result.ok) {
        const data = await result.json();
        res.status(201).json({
            status: false,
            data:data,
            msg: "Success"
        })
    }
    else{
        res.status(201).json({
            status: false,
            msg: result.statusText
        })
    }

}

/**
 *
 * @param page
 * @param count
 * @param look_back
 * @param cb
 * @returns {Promise<void>}
 */
const do_sync = async (page = 1, count,  look_back = 0, cb) => {

    let result = await fetch(`${process.env.JD_HOST}/wp-json/pos/v1/product/get?page=${page}&perpage=20&count=${count}&look_back=${look_back}`, {
        method: "GET",
        headers: {
            'Authorization': "Basic " + btoa(process.env.JD_ACCOUNT),
            'Content-Type': 'application/json'
        }
    })
    if(result.ok){
        const products = await result.json();

        if(count > 0){
            cb({
                total: products.total_products
            });
        }
        else{
            let created = [], updated = [];

            for(let i=0; i< products.length; i++){

                let {sku, name, price, image, barcode} = products[i];

                const exists = await Product.findOne({"sku": sku});
                if(!exists){
                    const product = await Product.create({
                        sku,
                        barcode,
                        name,
                        price,
                        image
                    });
                    created.push(product)
                }
                else{
                    await Product.updateOne({"sku": sku},{
                        name: name,
                        barcode: barcode,
                        price: price,
                        image: image
                    });
                    updated.push(products[i]);
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

/**
 * Sync product
 * @param req
 * @param res
 * @returns {Promise<void>}
 */
const syncProduct = async(req, res) => {
    const { page, look_back, count } = req.query;
    await do_sync(page, count, look_back,  (results) => {
      if(results){
          res.status(200).json(results)
      }
      else {
          res.status(400)
      }
    })

}

module.exports = {
    syncProduct,
    searchProducts,
    countProducts
}
