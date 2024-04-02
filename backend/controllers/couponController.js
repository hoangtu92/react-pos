/**
 * @route /api/coupon/redeem
 * @param req
 * @param res
 * @returns {Promise<void>}
 */
const pointRedeem = async (req, res) => {

    const {order_id, points} = req.body;

    let result = await fetch(`${process.env.JD_HOST}/wp-json/pos/v1/points/redeem`, {
        method: "POST",
        headers: {
            'Authorization': "Basic " + btoa(process.env.JD_ACCOUNT),
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            order_id: order_id,
            points: points
        })
    });
    if(result.ok){
        const data = await result.json();
        if(data.status)
            res.status(201).json(data);
        else res.status(403).json(data)
    }else{
        res.status(400).json({
            status: false,
            msg: result.statusText
        })
    }


}

module.exports = {
    pointRedeem
}
