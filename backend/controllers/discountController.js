const Discount = require("../models/discountModel");
const Setting = require("../models/settingModel");

const do_sync_settings = async(cb = null) => {

    const result = await fetch(`${process.env.JD_HOST}/wp-json/pos/v1/get-settings`, {
        method: "GET",
        headers: {
            'Authorization': "Basic " + btoa(process.env.JD_ACCOUNT),
            'Content-Type': 'application/json'
        }
    });

    if(result.ok) {
        const data = await result.json();
        if(data){

            let redeem_ratio = await Setting.findOneAndUpdate({name: "redeem_ratio"}, {
                value: data["redeem_ratio"]
            });

            if(!redeem_ratio){
                redeem_ratio = await Setting.create({
                    name: "redeem_ratio",
                    value: data["redeem_ratio"]
                })
            }

            let earn_ratio = await Setting.findOneAndUpdate({name: "earn_ratio"}, {
                value: data["earn_ratio"]
            });

            if(!earn_ratio){
                earn_ratio = await Setting.create({
                    name: "earn_ratio",
                    value: data["earn_ratio"]
                })
            }


            if(cb) cb({
                redeem_ratio,
                earn_ratio,
            });
        }
    }
    else{
        console.error("Error during sync settings")
    }
}

const do_sync_discounts = async(cb = null) => {
    const result = await fetch(`${process.env.JD_HOST}/wp-json/pos/v1/get-discount-rules`, {
        method: "GET",
        headers: {
            'Authorization': "Basic " + btoa(process.env.JD_ACCOUNT),
            'Content-Type': 'application/json'
        }
    });

    if(result.ok) {
        const data = await result.json();
        if (data) {

            await Discount.deleteMany({});

            for(let i=0; i < data.length; i++){
                let {filters, additional, conditions, discount_type, exclusive, priority, title} = data[i];

                let adjustments = {};
                switch (discount_type){
                    case "wdr_simple_discount":
                        adjustments = data[i]["product_adjustments"];
                        break;
                    case "wdr_cart_discount":
                        adjustments = data[i]["cart_adjustments"];
                        break;
                    case "wdr_free_shipping":
                        // do not adjust anything
                        break;
                    case "wdr_bulk_discount":
                        adjustments = data[i]["bulk_adjustments"];
                        break;
                    case "wdr_set_discount":
                        adjustments = data[i]["set_adjustments"];
                        break;

                    case "wdr_buy_x_get_y_discount":
                        adjustments = data[i]["buy_x_get_y_adjustments"];
                        break;
                    case "wdr_buy_x_get_x_discount":
                        adjustments = data[i]["buy_x_get_x_adjustments"];
                        break;
                }

                adjustments = JSON.parse(adjustments);
                filters = JSON.parse(filters);
                conditions = JSON.parse(conditions);
                additional = JSON.parse(additional);

                await Discount.create({
                    title, discount_type, filters, conditions, additional,  exclusive, priority, adjustments
                })
            }

            if(cb) cb(data);
        }
    }
    else if(cb) cb(false)

}

/**
 *
 * @param discount
 * @param cartItems
 * @param orderObj
 * @param callback
 * @returns {*}
 */
const check_discount = (discount, cartItems, orderObj, callback = null) => {

    let matchedProducts = [];

    //Check filter
    let match_filter = 0;
    if(discount.filters) match_filter = Object.values(discount.filters).filter(e => {

        if(e.type === "all_products"){
            matchedProducts.push(0)
        }
        else{
            const filter_products = e["value"].concat(e["product_variants"]).map(e => parseInt(e));
            for(let i=0; i<cartItems.length;i++){
                if(e.type === "products"){
                    if(e.method === "in_list" && filter_products.indexOf(cartItems[i].product_id) >= 0){
                        // Product in list filter
                        matchedProducts.push(cartItems[i].product_id)
                    }
                    if(e.method === "not_in_list" && filter_products.indexOf(cartItems[i].product_id) < 0){
                        // Product in list filter
                        matchedProducts.push(cartItems[i].product_id)
                    }
                }
                // And so on
            }
        }

        return matchedProducts.length;
    }).length;

    // Check condition
    if(match_filter){

        const conditions_count = Object.values(discount.conditions).length;
        if(conditions_count > 0){
            const matched_conditions = is_discount_condition_match(discount, cartItems, matchedProducts);
            if(discount.additional && discount.additional["condition_relationship"] === "or" && matched_conditions.length > 0){
                console.log("Discount apply when either one condition is met");
                // Todo discount apply when either one condition is met

                if(callback) return callback(matchedProducts)
            }
            else if(matched_conditions.length == conditions_count){
                console.log("Discount apply when all condition are met");
                // Todo discount apply when all condition are met
                if(callback) return callback(matchedProducts)
            }

        }
        else{
            console.log("Discount apply when no conditions are specified")
            // Todo discount apply when no conditions are specified
            if(callback) return callback(matchedProducts)

        }
    }

}

/**
 *
 * @param discount
 * @param cartItems
 * @param matchedProducts
 * @returns {unknown[]|*[]}
 */
const is_discount_condition_match = (discount, cartItems, matchedProducts) => {
    const conditions = Object.values(discount.conditions);
    if(conditions) return conditions.filter(condition => {
        if(condition.type === "cart_subtotal"){
            const subTotal = cartItems.reduce((t, e) => {
                const {price, quantity, product_id} = e;

                if(condition.options.calculate_from === "from_cart"){
                    t += price * quantity;
                }
                else if(matchedProducts.indexOf(product_id) >= 0 || matchedProducts.indexOf(0) >= 0){
                        t+= price * quantity
                }
                return t;
            }, 0);

           if(condition.options.operator === "less_than"){
               return subTotal < condition.options.value;
           }
           else if(condition.options.operator === "less_than_or_equal"){
               return subTotal <= condition.options.value;
           }
           else if(condition.options.operator === "greater_than_or_equal"){
               return subTotal >= condition.options.value;
           }
           else if(condition.options.operator === "greater_than"){
               return subTotal > condition.options.value;
           }
        }
        else if(condition.type === "cart_items_quantity"){

        }
        else if(condition.type === "cart_line_items_count"){

        }
    });

    else return [];
}

/**
 * Perform direct discount to product price
 * @param cartItems
 * @param orderObj
 * @param adjustment
 * @param matchedProducts
 * @returns {*}
 */
const product_adjustment = (cartItems, orderObj, adjustment, matchedProducts) => {
    let total_discount = 0;
    cartItems.map(item => {

        if(!item.discount) item.discount = 0;
        if(!item.discounts) item.discounts = [];

        if(matchedProducts.indexOf(item.product_id) >= 0 || matchedProducts.indexOf(0) >= 0){
            let discount_value = 0;
            let item_discount_value = 0;
            if(adjustment.type === "percentage"){
                item_discount_value = (adjustment.value * item.price)/100
            }
            else if(adjustment.type === "flat"){
                item_discount_value =  parseInt(adjustment.value);

            }
            else if(adjustment.type === "fixed_price"){
                item_discount_value =  item.price - adjustment.value
            }

            discount_value =  item_discount_value * item.quantity;
            total_discount += discount_value;

            discount_value = Math.round(discount_value);
            item_discount_value = Math.round(item_discount_value);

            if(adjustment.apply_as_cart_rule !== "1"){

                item.discount += discount_value;
                item.discounts.push({
                    name: adjustment.label ?? adjustment.cart_label,
                    value: item_discount_value,
                    adjust: {type: adjustment.type, value: adjustment.value}
                })
            }
        }

        return item;
    });

    if(adjustment.apply_as_cart_rule === "1"){
        // Apply as coupon/discount
        orderObj.discounts.push({
            name: adjustment.label ?? adjustment.cart_label,
            value: Math.round(total_discount),
            adjust: {type: adjustment.type, value: adjustment.value}
        });
        orderObj.discount_value += orderObj.discounts.reduce((t, e) => {t += e.value; return t;}, 0)
    }



}

/**
 * Perform cart discount as coupon
 * @param cartItems
 * @param orderObj
 * @param adjustment
 * @param matchedProducts
 */
const cart_adjustment = (cartItems, orderObj, adjustment, matchedProducts) => {
    let discount_value = 0;

    if(adjustment.type === "percentage" || adjustment.type === "flat"){
        discount_value = cartItems.reduce((t, e) => {
            if(matchedProducts.indexOf(e.product_id) >= 0 || matchedProducts.indexOf(0) >= 0){
                if(adjustment.type === "percentage"){
                    t += (adjustment.value * e.price * e.quantity)/100
                }
                else if(adjustment.type === "flat"){
                    t += parseInt(adjustment.value);
                }
            }
            return t;
        }, 0);
    }
    else if(adjustment.type === "flat_in_subtotal"){
        discount_value = adjustment.value
    }

    // Apply as coupon/discount
    orderObj.discounts.push({
        name: adjustment.label ?? adjustment.cart_label,
        value: Math.round(discount_value),
        adjust: {type: adjustment.type, value: adjustment.value}
    });

    orderObj.discount_value += orderObj.discounts.reduce((t, e) => {t += e.value; return t;}, 0)
}

/**
 *
 * @param discount
 * @param matchedProducts
 * @param cartItems
 * @param orderObj
 * @returns {boolean}
 */
const do_discount = (discount, matchedProducts, cartItems, orderObj) => {

    if(!orderObj.discounts) orderObj.discounts = [];

    let discounted = false;

    switch (discount.discount_type){
        case "wdr_cart_discount":
            discounted = true;
            cart_adjustment(cartItems, orderObj, discount.adjustments, matchedProducts);
            break;
        case "wdr_simple_discount":
            discounted = true;
            product_adjustment(cartItems, orderObj, discount.adjustments, matchedProducts);
            break;
        case "wdr_bulk_discount":
            if(discount.adjustments.ranges) Object.values(discount.adjustments.ranges).map(range => {
                let quantity = 0;

                // Count quantity
                if(discount.adjustments.operator === "variation"){
                    // Count all variants in product
                    quantity = cartItems.reduce((t, e) => {
                        if(matchedProducts.indexOf(e.product_id) >= 0 || matchedProducts.indexOf(0) >= 0){
                            t += e.quantity
                        }
                        return t;
                    }, 0);
                }
                else if(discount.adjustments.operator === "product"){
                    // Count product only
                    console.warn("POS doesn't support count quantity by product")
                }
                else if(discount.adjustments.operator === "product_cumulative"){
                    // Count filter set
                    console.warn("POS doesn't support count quantity by filter set")
                }

                if(
                    (!range.from && !range.to) ||
                    (range.from && !range.to && range.from <= quantity) ||
                    (!range.from && range.to && range.to >= quantity) ||
                    (range.from && range.to && range.from <= quantity <= range.to)
                ){

                    discounted = true;
                    product_adjustment(cartItems, orderObj, range, matchedProducts);
                }
            });

            break;
        default: break;
    }

    return discounted;

}

/**
 *
 * @param discount
 * @param cartItems
 * @param orderObj
 * @returns {boolean}
 */
const process_discount = (discount, cartItems, orderObj = {}) => {

    return check_discount(discount, cartItems, orderObj, (matchedProducts) => {
        console.log("Filtered Discount: ", discount.title, matchedProducts);
        return do_discount(discount, matchedProducts, cartItems, orderObj);
    })

}

/**
 * @route /calc-discount
 * @param req
 * @param res
 * @returns {Promise<void>}
 */
const calculate_discount = async(req, res) => {
    let {cartItems, selectedCustomer, orderObj} = req.body;

    orderObj.discounts = [];
    orderObj.discount_value = 0;
    cartItems.map(e => {e.discount = 0; e.discounts = []; return e});

    const discounts = await Discount.find({}).sort('priority');
    const exclusive_discount = discounts.filter(e => e.exclusive);

    let did_exclusive = false;

    if(exclusive_discount.length){
        exclusive_discount.map(discount => {
            did_exclusive = process_discount(discount, cartItems, orderObj)
        });
    }

    if(!exclusive_discount.length || exclusive_discount.length && !did_exclusive){
        discounts.map(discount => {
            process_discount(discount, cartItems, orderObj)
        });
    }

    res.status(200).json({
        cartItems,
        orderObj,
        discounts,
        exclusive_discount,
        did_exclusive
    })
}


module.exports ={
    do_sync_settings,
    do_sync_discounts,
    calculate_discount
} ;
