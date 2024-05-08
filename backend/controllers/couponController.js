/**
 * @route /api/coupon/calc
 * @param req
 * @param res
 * @returns {Promise<void>}
 */
const calcCouponValue = async (req, res) => {
    const {points, customer_id} = req.body;
    const result = await fetch(`${process.env.JD_HOST}/wp-json/pos/v1/coupon/calc?points=${points}&customer_id=${customer_id}`, {
        method: "GET",
        headers: {
            'Authorization': "Basic " + btoa(process.env.JD_ACCOUNT),
            'Content-Type': 'application/json'
        }
    });
    if(result.ok) {
        const data = await result.json();
        if(data.status){
            res.status(201).json(data);
        }
        else{
            res.status(403).json(data);
        }

    }
    else{
        res.status(400).json({
            status: false,
            msg: result.statusText
        })
    }

}


module.exports = {
    calcCouponValue
}
