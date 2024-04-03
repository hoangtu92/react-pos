import httpRequest from '../../utils/request'

const orderCreate = async (order) => {
    // localhost:5000/api/order/add-order
    const response = await httpRequest.post("/order/add-order", order)
    return response.data
}

const redeemPoint = async (data) => {
    const {order_id, points} = data;
    // /api/coupon/redeem
    const response = await httpRequest.post("/coupon/redeem", {
        order_id: order_id, points: points
    });
    return response.data
}

const getOrders = async () => {
    // localhost:5000/api/order/get-orders
    const response = await httpRequest.get("/order/get-orders")
    return response.data
}

const removeOrder = async (order_id, thunkAPI) => {
    // localhost:5000/api/order/delete
    if(typeof order_id != "undefined"){
        const response = await httpRequest.delete("/order/delete/" + order_id)
        return response.data;
    }
    else return {};
}

const orderService = {
    orderCreate,
    getOrders,
    removeOrder,
    redeemPoint
}

export default orderService
