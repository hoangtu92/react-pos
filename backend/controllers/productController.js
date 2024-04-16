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
        products = await Product.find({$or: [{sku: new RegExp(query, "i")}, {name: reg}]}, null,  { limit: 12, skip: 0 })
    }

    res.status(201).json(products)
}

/**
 *
 * @param results
 * @param page
 * @param cb
 * @param perpage
 * @returns {Promise<void>}
 */
const do_sync = async (results, page = 1, cb, perpage = 100) => {

    let result = await fetch(`${process.env.JD_HOST}/wp-json/pos/v1/product/get?page=${page}&perpage=${perpage}`, {
        method: "GET",
        headers: {
            'Authorization': "Basic " + btoa(process.env.JD_ACCOUNT),
            'Content-Type': 'application/json'
        }
    })
    if(result.ok){
        const products = await result.json();
        let created = [], updated = [];

        for(let i=0; i< products.length; i++){

            let {sku, name, price, image} = products[i];

            const exists = await Product.findOne({"sku": sku});
            if(!exists){
                const product = await Product.create({
                    sku,
                    name,
                    price,
                    image
                });
                created.push(product)
            }
            else{
                await Product.updateOne({"sku": sku},{
                    name: name,
                    price: price,
                    image: image
                });
                updated.push(products[i]);
            }
        }

        results.push({
            created: created,
            updated: updated
        });

        if(products.length >= perpage){
            page++;
            await do_sync(results, page, cb, perpage)
        }
        else cb(true);
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
    syncProduct,
    searchProducts
}
