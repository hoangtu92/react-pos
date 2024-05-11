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
        products = await Product.find({}, null,  { limit: 20, skip: 0 }).sort('-date');
    }
    else{
        const filtered_query = query.replace(new RegExp("\\\\", "g"), "");
        const reg_1 = new RegExp(`^${filtered_query}\$`, "i");
        const reg_2 = new RegExp(filtered_query, "i");

        products = await Product.find({$or: [{sku: reg_1}, {barcode: reg_1}, {name: reg_2}]}, null,  { limit: 20, skip: 0 })
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
 * @param perpage
 * @param count
 * @param look_back
 * @param cb
 * @returns {Promise<void>}
 */
const do_sync = async (page = 1, perpage = 20, count,  look_back = 0, cb) => {

    let result = await fetch(`${process.env.JD_HOST}/wp-json/pos/v1/product/get?page=${page}&perpage=${perpage}&count=${count}&look_back=${look_back}`, {
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

                let {sku, name, price, image, barcode, original_price, id: product_id} = products[i];

                const exists = await Product.findOne({"product_id": product_id});
                if(!exists){
                    const product = await Product.create({
                        product_id,
                        sku,
                        barcode,
                        name,
                        price,
                        original_price,
                        image
                    });
                    created.push(product)
                }
                else{
                    await Product.updateOne({"product_id": product_id},{
                        product_id,
                        name: name,
                        barcode: barcode,
                        price: price,
                        original_price,
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
    await do_sync(page, 20, count, look_back,  (results) => {
      if(results){
          res.status(200).json(results)
      }
      else {
          res.status(400)
      }
    })

}

/**
 * @route /api/product/truncate
 * @param req
 * @param res
 * @returns {Promise<void>}
 */
const truncateProduct = async(req, res) => {
    await Product.deleteMany({});
    res.status(200).json({
        status: true,
        msg: "Success"
    })
}


/**
 *
 * @param req
 * @param res
 * @returns {Promise<void>}
 */
const getCarts = async(req, res) => {

    const {cookie} = req.body

    const result = await fetch(`${process.env.JD_HOST}/wp-json/wc/store/cart`, {
        method: "GET",
        credentials: "include",
        headers: {
            'Content-Type': 'application/json',
            "Cookie": cookie
        }
    });

    const nonce = result.headers.get("Nonce")
    if(result.ok) {
        const data = await result.json();
        res.status(201).json({
            status: true,
            data: data,
            nonce: nonce,
            msg: "Success"
        });
    }
    else{
        res.status(400).json({
            status: false,
            msg: result.statusText,
            nonce: nonce,
        })
    }
}

/**
 *
 * @param req
 * @param res
 * @returns {Promise<void>}
 */
const addCartItem = async (req, res) => {
    const {nonce, cookie, cart_item} = req.body;

    let formData = new FormData();
    formData.append("id", cart_item.product_id);
    formData.append("quantity", cart_item.quantity)
    formData.append("variation", []);

    const result = await fetch(`${process.env.JD_HOST}/wp-json/wc/store/cart/add-item`, {
        method: "POST",
        headers: {
            'Nonce': nonce,
            "Cookie": cookie,
        },
        mode: 'cors',
        credentials: "include",
        body: formData
    });

    if(result.ok) {
        const data = await result.json();
        res.status(200).json({
            status: true,
            cookie: result.headers.getSetCookie(),
            data: data
        })
    }
    else{
        res.status(200).json({
            status: false,
            msg: "Failed to add to cart",
        })
    }

}

/**
 *
 * @param req
 * @param res
 * @returns {Promise<void>}
 */
const addCartItems = async (req, res) => {
    const {nonce, cartItems} = req.body;

    const batch = cartItems.reduce((t, e) => {
        t.push({
            "path": "/wc/store/cart/add-item",
            "method": "POST",
            "cache": "no-store",
            "body": {
                "id": e.product_id,
                "quantity": e.quantity
            },
            "headers": {
                "Nonce": nonce
            }
        })
        return t;
    }, []);


    const request = {requests: batch}


    const result = await fetch(`${process.env.JD_HOST}/wp-json/wc/store/batch`, {
        method: "POST",
        headers: {
            'Nonce': nonce,
            //"Cookie": cookie,
            "Content-Type": "application/json"
        },
        mode: 'cors',
        credentials: "include",
        body: JSON.stringify(request)
    });

    if(result.ok) {
        const data = await result.json();
        res.status(200).json({
            status: true,
            cookie: result.headers.getSetCookie(),
            data: data
        })
    }
    else{
        res.status(200).json({
            status: false,
            msg: "Failed to add to cart",
            data: result.statusText
        })
    }

}

/**
 * @route
 * @param req
 * @param res
 * @returns {Promise<void>}
 */
const editCartItem = async(req, res) => {

    const {nonce, cookie, cart_item} = req.body;

    let formData = new FormData();
    formData.append("key", cart_item.key);
    formData.append("quantity", cart_item.quantity)

    const result = await fetch(`${process.env.JD_HOST}/wp-json/wc/store/cart/update-item`, {
        method: "POST",
        headers: {
            'Nonce': nonce,
            "Cookie": cookie,
        },
        mode: 'cors',
        credentials: "include",
        body: formData
    });


    if(result.ok) {
        const data = await result.json();

        res.status(200).json({
            status: true,
            data: data
        })
    }
    else{
        res.status(200).json({
            status: false,
            msg: "Failed to edit cart item",
        })
    }
}
/**
 *
 * @param req
 * @param res
 * @returns {Promise<void>}
 */
const removeCartItem = async(req, res) => {

    const {nonce, cookie, cart_item} = req.body;

    let formData = new FormData();
    formData.append("key", cart_item.key);

    const result = await fetch(`${process.env.JD_HOST}/wp-json/wc/store/cart/remove-item`, {
        method: "POST",
        headers: {
            'Nonce': nonce,
            "Cookie": cookie,
        },
        mode: 'cors',
        credentials: "include",
        body: formData
    });


    if(result.ok) {
        const data = await result.json();

        res.status(200).json({
            status: true,
            data: data
        })
    }
    else{
        res.status(200).json({
            status: false,
            msg: "Failed to edit cart item",
        })
    }
}

module.exports = {
    syncProduct,
    searchProducts,
    countProducts,
    truncateProduct,
    addCartItem,
    addCartItems,
    editCartItem,
    removeCartItem,
    getCarts,
    do_sync
}
