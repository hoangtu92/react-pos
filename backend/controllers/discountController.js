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
                const {filters, additional, conditions, discount_type, exclusive, priority, title} = data[i];
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
                await Discount.create({
                    title, discount_type, filters, conditions, additional,  exclusive, priority, adjustments
                })
            }

            if(cb) cb(data);
        }
    }
    else if(cb) cb(false)

}

module.exports ={
    do_sync_settings,
    do_sync_discounts
} ;
