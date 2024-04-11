import httpRequest from '../../utils/request'

const orderCreate = async (order) => {
    // localhost:5000/api/order/add-order
    const response = await httpRequest.post("/order/add-order", order)
    return response.data
}

const addCustomer = async (data) => {
    // localhost:5000/api/order/add-order
    const response = await httpRequest.post("/order/add-customer", data)
    return response.data
}

const updateOrder = async (order) => {
    // localhost:5000/api/order/update-order
    const response = await httpRequest.post("/order/update-order", order)
    return response.data
}

const getOrder = async (order_id) => {
    // localhost:5000/api/order/update-order
    const response = await httpRequest.get("/order/get/" + order_id)
    return response.data
}

const syncOrder = async (order_id) => {
    // localhost:5000/api/order/update-order
    const response = await httpRequest.post("/order/sync/" + order_id)
    return response.data
}

const calcPoint = async(data) => {
    // /api/coupon/calc
    const response = await httpRequest.post("/coupon/calc", data);
    return response.data
}
const issueInvoice = async (order_id) => {
    // /api/order/issue-invoice
    const response = await httpRequest.post("/invoice/issue", {
        order_id: order_id
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

const validateCarrierID = async (carrier_id) => {
    // /api/order/validate-carrier-id

    if(typeof carrier_id != "undefined"){
        const response = await httpRequest.post("/order/validate-carrier-id", {
            carrier_id: carrier_id
        })
        return response.data;
    }
    else return {};
}

const orderService = {
    orderCreate,
    getOrders,
    removeOrder,
    issueInvoice,
    updateOrder,
    getOrder,
    syncOrder,
    calcPoint,
    addCustomer,
    validateCarrierID
}

export default orderService
