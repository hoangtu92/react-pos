const Discount = require("../models/discountModel");
const Setting = require("../models/settingModel");


const do_sync_settings = async (cb = null) => {

    const result = await fetch(`${process.env.JD_HOST}/wp-json/pos/v1/get-settings`, {
        method: "GET",
        headers: {
            'Authorization': "Basic " + btoa(process.env.JD_ACCOUNT),
            'Content-Type': 'application/json'
        }
    });

    if (result.ok) {
        const data = await result.json();
        if (data) {

            let redeem_ratio = await Setting.findOneAndUpdate({name: "redeem_ratio"}, {
                value: data["redeem_ratio"]
            });

            if (!redeem_ratio) {
                redeem_ratio = await Setting.create({
                    name: "redeem_ratio",
                    value: data["redeem_ratio"]
                })
            }

            let earn_ratio = await Setting.findOneAndUpdate({name: "earn_ratio"}, {
                value: data["earn_ratio"]
            });

            if (!earn_ratio) {
                earn_ratio = await Setting.create({
                    name: "earn_ratio",
                    value: data["earn_ratio"]
                })
            }


            if (cb) cb({
                redeem_ratio,
                earn_ratio,
            });
        }
    } else {
        console.error("Error during sync settings")
    }
}

const do_sync_discounts = async (cb = null) => {
    const result = await fetch(`${process.env.JD_HOST}/wp-json/pos/v1/get-discount-rules`, {
        method: "GET",
        headers: {
            'Authorization': "Basic " + btoa(process.env.JD_ACCOUNT),
            'Content-Type': 'application/json'
        }
    });

    if (result.ok) {
        const data = await result.json();
        if (data) {

            await Discount.deleteMany({});

            for (let i = 0; i < data.length; i++) {
                let {filters, additional, conditions, discount_type, exclusive, priority, title} = data[i];

                let adjustments = {};
                switch (discount_type) {
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
                    title, discount_type, filters, conditions, additional, exclusive, priority, adjustments
                })
            }

            if (cb) cb(data);
        }
    } else if (cb) cb(false)

}

/**
 * @route /sync-discount
 * @param req
 * @param res
 * @returns {Promise<void>}
 */
const syncDiscountSettings = async (req, res) => {
    let results = [];
    await do_sync_settings(data => {
        results.push(data);
    });

    await do_sync_discounts(data => {
        results.push(data);
    });

    if (results) {
        res.status(200).json({
            status: true,
            result: results
        })
    } else {
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
    if (discount.filters) matchedFilters = Object.values(discount.filters).filter(filter => {

        if (filter.type === "all_products") {
            matchedProducts.push(0)
        } else if (filter.type === "product_on_sale") {
            cartItems.map(item => {
                if (item.original_price > item.price) {
                    if (filter.method === "in_list") {
                        // On sale product
                        matchedProducts.push(item.product_id);
                        if(item.parent_id) matchedProducts.push(item.parent_id);
                    }
                    if (filter.method === "not_in_list") {
                        // Must be run after the filter
                        delete (matchedProducts[matchedProducts.indexOf(item.product_id)]);
                        if(item.parent_id) delete (matchedProducts[matchedProducts.indexOf(item.parent_id)]);
                    }
                }

            });
        } else if (filter["value"]) {
            cartItems.map(item => {
                let filter_check = false;
                switch (filter.type) {
                    case "products":
                        filter_check = filter["value"].concat(filter["product_variants"]).map(e => e.toString()).indexOf(item.product_id.toString()) >= 0;
                        break;
                    case "product_sku":
                        filter_check = filter["value"].indexOf(item.sku) >= 0;
                        break;
                    case "pwb-brand":
                        if (item.brands) filter_check = item.brands.filter(e => filter["value"].indexOf(e) >= 0).length;
                        break;
                    case "product_category":
                        if (item.categories) filter_check = item.categories.filter(e => filter["value"].indexOf(e) >= 0).length;
                        break;
                    case "product_tags":
                        if (item.tags) filter_check = item.tags.filter(e => filter["value"].indexOf(e) >= 0).length;
                        break;
                    case "product_attributes":
                        break;
                }

                if ((filter.method === "in_list" && filter_check) ||
                    (filter.method === "not_in_list" && !filter_check)) {
                    matchedProducts.push(item.product_id)
                }
            })
        }

        return matchedProducts.length;
    });

    // Check condition
    if (matchedFilters.length) {
        const conditions_count = Object.values(discount.conditions).length;
        if (conditions_count > 0) {
            const matchedConditions = check_condition_rules(discount, cartItems, matchedProducts);
            if (discount.additional && discount.additional["condition_relationship"] === "or" && matchedConditions.length > 0) {
                // Todo discount apply when either one condition is met

                if (callback) return callback(matchedProducts, matchedFilters, matchedConditions)
            } else if (matchedConditions.length == conditions_count) {
                // Todo discount apply when all condition are met
                if (callback) return callback(matchedProducts, matchedFilters, matchedConditions)
            }

        } else {
            console.log("Discount apply when no conditions are specified")
            if (callback) return callback(matchedProducts, matchedFilters, [])

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
    if (conditions) return conditions.filter(condition => {

        const taxonomies = {
            "cart_item_product_category": "categories",
            "wdr_cart_item_pwb-brand": "brands",
            "cart_item_product_tags": "tags",
        }

        let compare_value;
        let condition_value = condition.options.value ?? condition.options.from;
        let condition_value2 = condition.options.to ?? 0;
        let operator = condition.options.operator;
        if (condition.type === "cart_item_product_combination" || condition.type === "cart_item_category_combination") {

            let all_presence, compare_arr;

            if (condition.type === "cart_item_product_combination") {
                compare_arr = condition.options.product.map(product_id => {
                    return cartItems.reduce((t, item) => {
                        if (product_id == item.product_id || product_id == item.parent_id) {
                            t += item.quantity + item.discounted_qty;
                        }
                        return t;
                    }, 0);

                });

                // Whether all categories in condition are presence in the cart
                all_presence = compare_arr.filter(e => e).length >= condition.options.product.length;

            } else {
                compare_arr = condition.options.category.map(cat_id => {
                    return cartItems.reduce((t, item) => {
                        const {categories, discount, price, quantity} = item;

                        if (categories && categories.indexOf(cat_id) >= 0) {
                            if (condition.options.type === "cart_quantity") {
                                t += quantity;
                            } else if (condition.options.type === "cart_subtotal") {
                                t += (price - discount) * quantity;
                            } else if (condition.options.type === "cart_line_item") {
                                t += 1;
                            }
                        }

                        return t;
                    }, 0)
                });

                // Whether all categories in condition are presence in the cart
                all_presence = compare_arr.filter(e => e).length >= condition.options.category.length;
            }

            //console.log(compare_arr, "all_presence", all_presence)

            if (condition.options.type === "each") {
                compare_value = all_presence ? Math.min(...compare_arr) : 0;
            } else if (condition.options.type === "combine") {
                compare_value = all_presence ? compare_arr.reduce((t, e) => {
                    t += e;
                    return t;
                }, 0) : 0;
            } else if (condition.options.type === "any") {
                compare_value = Math.max(...compare_arr);
            }
        } else if (Object.keys(taxonomies).indexOf(condition.type) >= 0) {

            operator = condition.options.cartqty;
            condition_value = condition.options.qty;
            compare_value = cartItems.reduce((t, e) => {

                if (condition.options.operator === "in_list") {
                    if (e[taxonomies[condition.type]] && e[taxonomies[condition.type]].filter(tax_id => condition.options.value.indexOf(tax_id) >= 0).length > 0) {
                        t++;
                    }
                } else if (condition.options.operator === "not_in_list") {
                    if (!e[taxonomies[condition.type]] || !e[taxonomies[condition.type]].filter(tax_id => condition.options.value.indexOf(tax_id) < 0).length) {
                        t++;
                    }
                }
                return t;
            }, 0);
        } else {
            compare_value = cartItems.reduce((t, e) => {
                const {price, quantity, product_id, discount} = e;

                if (condition.options.calculate_from === "from_cart"
                    || matchedProducts.indexOf(product_id) >= 0
                    || matchedProducts.indexOf(0) >= 0) {

                    if (condition.type === "cart_subtotal") {
                        t += (price - discount) * quantity;
                    } else if (condition.type === "cart_items_quantity") {
                        t += quantity;
                    } else if (condition.type === "cart_line_items_count") {
                        t += 1;
                    }
                }
                return t;
            }, 0);
        }

        if (!compare_value) return false;

        if (operator === "less_than") {
            return compare_value < condition_value
        } else if (operator === "less_than_or_equal") {
            return compare_value <= condition_value
        } else if (operator === "greater_than_or_equal") {
            return compare_value >= condition_value
        } else if (operator === "greater_than") {
            return compare_value > condition_value
        } else if (operator === "equal_to") {
            return compare_value == condition_value
        } else if (operator === "not_equal_to") {
            return compare_value != condition_value
        } else if (operator === "in_range") {
            return compare_value > condition_value && compare_value < condition_value2
        }
    });

    else return [];
}

/**
 *
 * @param cartItems
 * @param item
 * @param orderObj
 * @param discount
 * @param adjustment
 * @returns {boolean|{image: (string[]|React.SVGFactory|React.SVGProps<SVGImageElement>|string|*), original_price: number, quantity: (number|*), discounts: [{name: string, value: number}], gifted: boolean, price: number, name: string, discount: number, id: string, sku: (string[]|*)}}
 */
const gift_adjustment = (cartItems, item, orderObj, discount, adjustment) => {
    const gift_qty = adjustment.recursive ? Math.floor(item.quantity / adjustment.from) * adjustment.free_qty : adjustment.free_qty;

    if (gift_qty > 0) {
        let item_to_add = {
            id: (Math.floor(Math.random() * 100) + 1) + item.id + "_gift",
            name: "[Gift] " + item.name,
            image: item.image,
            product_id: item.product_id,
            parent_id: item.parent_id,
            sku: item.sku,
            quantity: gift_qty,
            regular_qty: gift_qty,
            price: 0,
            discount: 0,
            discounts: [{
                name: "Free",
                value: 0
            }],
            discount_items: [],
            discounted_qty: 0,
            original_price: item.original_price,
            gifted: true
        };

        cartItems.push(item_to_add);

    }
    return false;
}

/**
 *
 * @param cartItems
 * @param item
 * @param orderObj
 * @param discount
 * @param adjustment
 * @param matchedProducts
 * @param matchedFilters
 * @param affected_qty
 * @returns {number}
 */
const item_adjustment = (cartItems, item, orderObj, discount, adjustment, matchedProducts, matchedFilters = false, affected_qty) => {
    if (!item.discount) item.discount = 0;
    if (!item.discounts) item.discounts = [];
    let item_discount_value = 0, remain_qty = affected_qty;

    if (matchedProducts.indexOf(item.product_id) >= 0 || matchedProducts.indexOf(0) >= 0) {

        if (adjustment.type === "free_product") {
            item_discount_value = item.price;
        }
        else if (adjustment.type === "percentage") {
            item_discount_value = (adjustment.value * (item.price - item.discount)) / 100
        } else if (adjustment.type === "flat") {
            item_discount_value = parseInt(adjustment.value);

        } else if (adjustment.type === "fixed_price") {
            item_discount_value = item.price - adjustment.value
        }

        affected_qty = affected_qty ? affected_qty : adjustment.recursive ? Math.floor(item.quantity / adjustment.from) * adjustment.free_qty : adjustment.free_qty;

        remain_qty = affected_qty;


        item.discount_items = item.discount_items || [];
        item.discounted_qty = item.discounted_qty || 0;

        let discount_item = {
            quantity: affected_qty,
            id: item.id + "_discounted",
            price: item.price - item_discount_value,
            name: adjustment.label ? adjustment.label : discount.adjustments.cart_label ? discount.adjustments.cart_label : discount.title,
            reason: matchedFilters,
            adjust: {type: adjustment.type, value: adjustment.value}
        };

        if(item.quantity <= affected_qty){
            discount_item.quantity = item.quantity;
            remain_qty = affected_qty - item.quantity;
            item.discounted_qty += item.quantity;
            item.regular_qty  = 0;
        }
        else{
            item.regular_qty -= affected_qty;
            item.discounted_qty += affected_qty;
            remain_qty = 0;
        }

        item.discount_items.push(discount_item);
    }

    return remain_qty;
}

/**
 *
 * @param item
 * @param discount
 * @param adjustment
 * @param matchedProducts
 * @param matchedFilters
 * @returns {number}
 */
const item_discount = (item, discount, adjustment, matchedProducts, matchedFilters) => {
    let item_discount_value = 0;

    if (adjustment.type === "percentage") {
        item_discount_value = (adjustment.value * (item.price - item.discount)) / 100
    } else if (adjustment.type === "flat") {
        item_discount_value = parseInt(adjustment.value);

    } else if (adjustment.type === "fixed_price") {
        item_discount_value = item.price - adjustment.value
    }

    if (discount.adjustments.apply_as_cart_rule !== "1") {

        item.discount += item_discount_value;
        item.discounts.push({
            name: adjustment.label ? adjustment.label : discount.adjustments.cart_label ? discount.adjustments.cart_label : discount.title,
            value: item_discount_value,
            reason: matchedFilters,
            adjust: {type: adjustment.type, value: adjustment.value}
        })
    }

    return item_discount_value;
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

    qualified_cart_items(cartItems, matchedProducts, item => {
        total_discount += item_discount(item, discount, adjustment, matchedProducts, matchedFilters)
    })

    if (discount.adjustments.apply_as_cart_rule === "1") {
        // Apply as coupon/discount
        orderObj.discounts.push({
            name: adjustment.label ? adjustment.label : discount.adjustments.cart_label ? discount.adjustments.cart_label : discount.title,
            value: total_discount,
            reason: matchedFilters,
            adjust: {type: adjustment.type, value: adjustment.value}
        });
        orderObj.discount_value += orderObj.discounts.reduce((t, e) => {
            t += e.value;
            return t;
        }, 0)
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

    if (adjustment.type === "percentage" || adjustment.type === "flat") {
        discount_value = cartItems
            .filter(e => !e.gifted && (matchedProducts.indexOf(e.product_id) >= 0 || matchedProducts.indexOf(0) >= 0))
            .reduce((t, e) => {
            if (adjustment.type === "percentage") {
                // Todo check valid rule
                t += (adjustment.value * (e.price - e.discount) * e.quantity) / 100
            } else if (adjustment.type === "flat") {
                t += parseInt(adjustment.value) * e.quantity;
            }
            return t;
        }, 0);
    } else if (adjustment.type === "flat_in_subtotal") {
        discount_value = adjustment.value
    }

    // Apply as coupon/discount
    orderObj.discounts.push({
        name: adjustment.label ? adjustment.label : discount.adjustments.cart_label ? discount.adjustments.cart_label : discount.title,
        value: discount_value,
        reason: matchedFilters,
        adjust: {type: adjustment.type, value: adjustment.value}
    });

    orderObj.discount_value += orderObj.discounts.reduce((t, e) => {
        t += e.value;
        return t;
    }, 0)
}

const qualified_cart_items = (cartItems, matchedProducts, on_qualified) => {
    return cartItems
        .filter(e => !e.gifted && (matchedProducts.indexOf(e.product_id) >= 0 || matchedProducts.indexOf(0) >= 0))
        .map(item => {
            if(on_qualified) on_qualified(item);
            return item;
        });
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
    if (!orderObj.discounts) orderObj.discounts = [];

    let discounted = false;

    switch (discount.discount_type) {
        case "wdr_cart_discount":
            discounted = true;
            cart_adjustment(cartItems, orderObj, discount, discount.adjustments, matchedProducts, matchedFilters);
            break;
        case "wdr_simple_discount":
            discounted = true;
            product_adjustment(cartItems, orderObj, discount, discount.adjustments, matchedProducts, matchedFilters);
            break;
        case "wdr_bulk_discount":
            discounted = true;
            checkQuantityAndDoDiscount(cartItems, discount, matchedProducts, async (range, item, quantity) => {
                //console.log("Bulk discount: ", range, quantity)
                item_discount(item, discount, range, matchedProducts, matchedFilters)
            })

            break;

        case "wdr_buy_x_get_x_discount":
            discounted = true;

            qualified_cart_items(cartItems, matchedProducts, item => {
                checkRange(Object.values(discount.adjustments.ranges), item.quantity).map(range => {

                    if (range.free_type === "free_product") {

                        gift_adjustment(cartItems, item, orderObj, discount, range);

                    } else if (range.free_type === "percentage" || range.free_type === "flat") {
                        const adjustment = {
                            apply_as_cart_rule: 0,
                            type: range.free_type,
                            value: range.free_value,
                            from: range.from,
                            free_qty: range.free_qty,
                            recursive: range.recursive
                        };
                        item_adjustment(cartItems, item, orderObj, discount, adjustment, matchedProducts, matchedFilters)
                    }

                });
            })

            break;

        case "wdr_buy_x_get_y_discount":
            discounted = true;

            const getItemY = (range, item, cb) => {
                let Y;
                const free_qty = range.recursive ? Math.floor(item.quantity / range.from) * range.free_qty : range.free_qty;

                // Discount get free quantity/fixed/percentage discounted on specific product (Increase quantity even on exists product in cart)
                if (discount.adjustments.type === "bxgy_product") {

                    if(!orderObj.bxgy_items) orderObj.bxgy_items = [];
                    orderObj.bxgy_items.push({
                        items: range.products,
                        qty: free_qty,
                        value: range.free_value,
                        type: range.free_type,
                        mode: discount.adjustments.mode,
                        name: discount.title
                    });

                    return;

                    // Discount apply on the cheapest/highest price of product in the cart that belong to specified category list
                } else if (discount.adjustments.type === "bxgy_category") {
                    Y = cartItems
                        .filter(e => !e.gifted && e.categories && range.categories && range.categories.filter(cat_id => e.categories.indexOf(cat_id) >= 0).length > 0);

                    // Discount apply on the cheapest/highest price of product in the cart no matter which category it belong to
                } else if (discount.adjustments.type === "bxgy_all") {
                    Y = cartItems.filter(e => !e.gifted);
                }

                if(item && item.variant_ids){
                    Y = Y.filter(e => (item.variant_ids.indexOf(e.product_id) >= 0 || e.product_id == item.product_id));
                }

                Y = Y.sort((a, b) => discount.adjustments.mode === "cheapest" ? a.price - b.price : b.price - a.price);

                if(Y && Y.length > free_qty){
                    Y = Y.slice(0, Y.length - free_qty);
                }
                return cb(Y, free_qty)
            }

            checkQuantityAndDoDiscount(cartItems, discount, matchedProducts, async (range, item) => {

                await getItemY(range, item, (item_Y, free_qty) => {
                    if (item_Y) {

                        const adjustment = {
                            apply_as_cart_rule: 0,
                            type: range.free_type,
                            value: range.free_value,
                            from: range.from,
                            free_qty: range.free_qty,
                            recursive: range.recursive
                        };

                        let remain_qty = free_qty;
                        while(item_Y.length){
                            if(remain_qty > 0){
                                remain_qty = item_adjustment(cartItems, item_Y.shift(), orderObj, discount, adjustment, matchedProducts, matchedFilters, remain_qty)
                            }

                        }
                    }
                });
            }, true)

            break;
        default:
            break;
    }

    return discounted;

}

/**
 *
 * @param cartItems
 * @param discount
 * @param matchedProducts
 * @param cb
 * @param bxgy
 */
const checkQuantityAndDoDiscount = (cartItems, discount, matchedProducts, cb, bxgy = false) => {
    let loop_items = cartItems;
    if (discount.adjustments.operator === "product_cumulative") {
        // Count filter set
        const quantity = qualified_cart_items(cartItems, matchedProducts).reduce((t, e) => {
                t += e.quantity + e.discounted_qty;
                return t;
            }, 0);

        checkRange(Object.values(discount.adjustments.ranges), quantity).map(async range => {
            if(cb) {
                if(bxgy) cb(range, {quantity})
                else qualified_cart_items(cartItems, matchedProducts, item => {
                    cb(range, item, quantity)
                })
            }
        });
    } else {

        if (discount.adjustments.operator === "product") {
            // Count product only
            // Keep cartItems
        }
        // Count quantity
        else if (discount.adjustments.operator === "variation") {
            // Count all variants in product
            // Group cart item by product parent
            loop_items = Object.values(cartItems.reduce((t, e) => {
                if (e.parent_id) {
                    if (!t[e.parent_id]) t[e.parent_id] = [];
                    t[e.parent_id].push(e);
                } else {
                    if (!t[e.product_id]) t[e.product_id] = [];
                    t[e.product_id].push(e);
                }
                return t;
            }, {})).map(variants => {
                return variants.reduce((t, e) => {
                    t.quantity += e.quantity + e.discounted_qty;
                    t.product_id = e.parent_id ? e.parent_id : e.product_id;
                    t.variants.push(e);
                    t.variant_ids.push(e.product_id);
                    return t;
                }, {quantity: 0, variants: [], variant_ids: []})
            });

        }

        qualified_cart_items(loop_items, matchedProducts, item => {
            checkRange(Object.values(discount.adjustments.ranges), item.quantity).map(async range => {
                if(cb) cb(range, item)
            });
        })
    }
}

/**
 *
 * @param ranges
 * @param quantity
 * @returns {*}
 */
const checkRange = (ranges, quantity) => {
    return ranges.filter(range => {
        return (
            // WHen recursive enabled, check for quantity >= minimum value
            (range.recursive && quantity >= range.from) ||
            // When recursive disable, check quantity between range [min max]
            (!range.recursive && ((!range.from && !range.to) ||
                (range.from && !range.to && range.from <= quantity) ||
                (!range.from && range.to && range.to >= quantity) ||
                (range.from && range.to && range.from <= quantity && range.to >= quantity)))
        );
    })
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
const calculate_discount = async (req, res) => {
    let {cartItems, selectedCustomer, orderObj} = req.body;

    orderObj.discounts = [];
    orderObj.discount_value = 0;
    orderObj.bxgy_items = [];
    cartItems = cartItems.filter(e => !e.gifted)
    cartItems.map(e => {
        e.discount = 0;
        e.discounts = [];
        e.discount_items = [];
        e.discounted_qty = 0;
        e.regular_qty = e.quantity;
        return e
    });

    const discounts = await Discount.find({}).sort('priority');
    const exclusive_discount = discounts.filter(e => e.exclusive);

    let did_exclusive = false;

    if (exclusive_discount.length) {
        exclusive_discount.map(discount => {
            did_exclusive = process_discount(discount, cartItems, orderObj)
        });
    }

    if (!exclusive_discount.length || exclusive_discount.length && !did_exclusive) {
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


module.exports = {
    do_sync_settings,
    do_sync_discounts,
    calculate_discount,
    syncDiscountSettings
};
