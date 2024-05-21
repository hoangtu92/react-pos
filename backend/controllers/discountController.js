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
 * @route /sync-discount
 * @param req
 * @param res
 * @returns {Promise<void>}
 */
const syncDiscountSettings = async(req, res) => {
    let results = [];
    await do_sync_settings(data => {
        results.push(data);
    });

    await do_sync_discounts(data => {
        results.push(data);
    });

    if(results){
        res.status(200).json({
            status: true,
            result: results
        })
    }
    else {
        res.status(400)
    }
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
    let matchedFilters = [];
    if(discount.filters) matchedFilters = Object.values(discount.filters).filter(filter => {

        if(filter.type === "all_products"){
            matchedProducts.push(0)
        }
        else if(filter.type === "product_on_sale"){
            cartItems.map(item => {
                if(item.original_price > item.price){
                    if(filter.method === "in_list"){
                        // On sale product
                        matchedProducts.push(item.product_id)
                    }
                    if(filter.method === "not_in_list"){
                        // Must be run after the filter
                        delete(matchedProducts[matchedProducts.indexOf(item.product_id)])
                    }
                }

            });
        }
        else if(filter["value"]){
            cartItems.map(item => {
                let filter_check = false;
                switch(filter.type){
                    case "products":
                        filter_check = filter["value"].concat(filter["product_variants"]).map(e => e.toString()).indexOf(item.product_id.toString()) >= 0;
                        break;
                    case "product_sku":
                        filter_check = filter["value"].indexOf(item.sku) >= 0;
                        break;
                    case "pwb-brand":
                        if(item.brands) filter_check = item.brands.filter(e => filter["value"].indexOf(e) >= 0).length;
                        break;
                    case "product_category":
                        if(item.categories) filter_check = item.categories.filter(e => filter["value"].indexOf(e) >= 0).length;
                        break;
                    case "product_tags":
                        if(item.tags) filter_check = item.tags.filter(e => filter["value"].indexOf(e) >= 0).length;
                        break;
                    case "product_attributes":
                        break;
                }

                if( (filter.method === "in_list" && filter_check) ||
                    (filter.method === "not_in_list" && !filter_check)){
                    matchedProducts.push(item.product_id)
                }
            })
        }

        return matchedProducts.length;
    });

    // Check condition
    if(matchedFilters.length){

        const conditions_count = Object.values(discount.conditions).length;
        if(conditions_count > 0){
            const matchedConditions = check_condition_rules(discount, cartItems, matchedProducts);
            if(discount.additional && discount.additional["condition_relationship"] === "or" && matchedConditions.length > 0){
                // Todo discount apply when either one condition is met

                if(callback) return callback(matchedProducts, matchedFilters, matchedConditions)
            }
            else if(matchedConditions.length == conditions_count){
                // Todo discount apply when all condition are met
                if(callback) return callback(matchedProducts, matchedFilters, matchedConditions)
            }

        }
        else{
            console.log("Discount apply when no conditions are specified")
            if(callback) return callback(matchedProducts, matchedFilters, [])

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
const check_condition_rules = (discount, cartItems, matchedProducts) => {
    const conditions = Object.values(discount.conditions);
    if(conditions) return conditions.filter(condition => {

        let compare_value;
        let condition_value = condition.options.value ?? condition.options.from;
        let condition_value2 = condition.options.to ?? 0;
        if(condition.type === "cart_item_product_combination"){

            let compare_arr = cartItems.reduce((t, item) => {

                if(condition.options.product.indexOf(item.product_id.toString()) >= 0
                || condition.options.product.indexOf(item.parent_id.toString()) >=0
                || condition.options.product_variants.indexOf(item.product_id) >= 0){

                    if(item.parent_id){
                        if(!t[item.parent_id]) t[item.parent_id] = 0;
                        t[item.parent_id] += item.quantity;
                    }
                    else{
                        if(!t[item.product_id]) t[item.product_id] = 0;
                        t[item.product_id] += item.quantity;
                    }

                }

                return t;

            }, {});

            compare_arr = Object.values(compare_arr);

            // Whether all categories in condition are presence in the cart
            const all_products_presence = compare_arr.length >= condition.options.product.length;

            if(condition.options.type === "each"){
                compare_value = all_products_presence ? Math.min(...compare_arr) : 0;
            }
            else if(condition.options.type === "combine"){
                compare_value = all_products_presence ? compare_arr.reduce((t, e) => {t += e; return t;}, 0) : 0;
            }
            else if(condition.options.type === "any"){
                compare_value = Math.max(...compare_arr);
            }
        }

        else if(condition.type === "cart_item_category_combination"){

            let compare_arr = condition.options.category.map(cat_id => {
                return cartItems.reduce((t, item) => {
                    const {categories, discount, price, quantity} = item;

                    if(categories && categories.indexOf(cat_id) >= 0){
                        if(condition.options.type === "cart_quantity"){
                            t += quantity;
                        }
                        else if(condition.options.type === "cart_subtotal"){
                            t += (price - discount) * quantity;
                        }
                        else if(condition.options.type === "cart_line_item"){
                            t += 1;
                        }
                    }

                    return t;
                }, 0)
            });

            // Whether all categories in condition are presence in the cart
            const all_cats_presence = compare_arr.length >= condition.options.category.length;


            if(condition.options.combination === "each"){
                compare_value = all_cats_presence ? Math.min(...compare_arr) : 0;
            }
            else if(condition.options.combination === "combine"){
                compare_value = compare_arr.reduce((t, e) => {t += e; return t;}, 0);
            }
            else if(condition.options.combination === "any"){
                compare_value = Math.max(...compare_arr);
            }

            //console.log(compare_arr, compare_value)
        }
        else{
            compare_value = cartItems.reduce((t, e) => {
                const {price, quantity, product_id, discount} = e;

                if(condition.options.calculate_from === "from_cart"
                    || matchedProducts.indexOf(product_id) >= 0
                    || matchedProducts.indexOf(0) >= 0){

                    if(condition.type === "cart_subtotal"){
                        t += (price - discount) * quantity;
                    }
                    else if(condition.type === "cart_items_quantity"){
                        t += quantity;
                    }
                    else if(condition.type === "cart_line_items_count"){
                        t += 1;
                    }

                }
                return t;
            }, 0);
        }

        if(!compare_value) return false;

        if(condition.options.operator === "less_than"){
            return compare_value < condition_value
        }
        else if(condition.options.operator === "less_than_or_equal"){
            return compare_value <= condition_value
        }
        else if(condition.options.operator === "greater_than_or_equal"){
            return compare_value >= condition_value
        }
        else if (condition.options.operator === "greater_than"){
            return compare_value > condition_value
        }
        else if (condition.options.operator === "equal_to"){
            return compare_value == condition_value
        }
        else if (condition.options.operator === "not_equal_to"){
            return compare_value != condition_value
        }
        else if (condition.options.operator === "in_range"){
            return compare_value > condition_value && quantity < condition_value2
        }
    });

    else return [];
}

/**
 * Perform direct discount to product price
 * @param cartItems
 * @param orderObj
 * @param discount
 * @param adjustment
 * @param matchedProducts
 * @param matchedFilters
 * @returns {*}
 */
const product_adjustment = (cartItems, orderObj, discount, adjustment, matchedProducts, matchedFilters) => {
    let total_discount = 0;
    cartItems.map(item => {

        if(!item.discount) item.discount = 0;
        if(!item.discounts) item.discounts = [];

        if(matchedProducts.indexOf(item.product_id) >= 0 || matchedProducts.indexOf(0) >= 0){
            let discount_value;
            let item_discount_value = 0;
            if(adjustment.type === "percentage"){
                item_discount_value = (adjustment.value * (item.price - item.discount))/100
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
                    name: adjustment.label ? adjustment.label : adjustment.cart_label ? adjustment.cart_label : discount.title,
                    value: item_discount_value,
                    reason: matchedFilters,
                    adjust: {type: adjustment.type, value: adjustment.value}
                })
            }
        }

        return item;
    });

    if(adjustment.apply_as_cart_rule === "1"){
        // Apply as coupon/discount
        orderObj.discounts.push({
            name: adjustment.label ? adjustment.label : adjustment.cart_label ? adjustment.cart_label : discount.title,
            value: Math.round(total_discount),
            reason: matchedFilters,
            adjust: {type: adjustment.type, value: adjustment.value}
        });
        orderObj.discount_value += orderObj.discounts.reduce((t, e) => {t += e.value; return t;}, 0)
    }



}

/**
 * Perform cart discount as coupon
 * @param cartItems
 * @param orderObj
 * @param discount
 * @param adjustment
 * @param matchedProducts
 * @param matchedFilters
 */
const cart_adjustment = (cartItems, orderObj, discount, adjustment, matchedProducts, matchedFilters) => {
    let discount_value = 0;

    if(adjustment.type === "percentage" || adjustment.type === "flat"){
        discount_value = cartItems.reduce((t, e) => {
            if(matchedProducts.indexOf(e.product_id) >= 0 || matchedProducts.indexOf(0) >= 0){
                if(adjustment.type === "percentage"){
                    // Todo check valid rule
                    t += (adjustment.value * (e.price - e.discount) * e.quantity)/100
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
        name: adjustment.label ? adjustment.label : adjustment.cart_label ? adjustment.cart_label : discount.title,
        value: Math.round(discount_value),
        reason: matchedFilters,
        adjust: {type: adjustment.type, value: adjustment.value}
    });

    orderObj.discount_value += orderObj.discounts.reduce((t, e) => {t += e.value; return t;}, 0)
}

/**
 *
 * @param discount
 * @param matchedProducts
 * @param matchedFilters
 * @param matchedConditions
 * @param cartItems
 * @param orderObj
 * @returns {boolean}
 */
const do_discount = (discount, matchedProducts, matchedFilters, matchedConditions, cartItems, orderObj) => {

    if(!orderObj.discounts) orderObj.discounts = [];

    let discounted = false;

    switch (discount.discount_type){
        case "wdr_cart_discount":
            discounted = true;
            cart_adjustment(cartItems, orderObj, discount, discount.adjustments, matchedProducts, matchedFilters);
            break;
        case "wdr_simple_discount":
            discounted = true;
            product_adjustment(cartItems, orderObj, discount, discount.adjustments, matchedProducts, matchedFilters);
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
                    product_adjustment(cartItems, orderObj, discount, range, matchedProducts, matchedFilters);
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

    return check_discount(discount, cartItems, orderObj, (matchedProducts, matchedFilters, matchedConditions) => {
        return do_discount(discount, matchedProducts, matchedFilters, matchedConditions, cartItems, orderObj);
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
    calculate_discount,
    syncDiscountSettings
} ;
