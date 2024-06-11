import httpRequest from '../../utils/request'

const orderCreate = async (order) => {
    // localhost:5000/api/order/add-order
    const response = await httpRequest.post("/order/add-order", order)
    return response.data
}

const syncOrder = async (id) => {
    // localhost:5000/api/order/update-order
    const response = await httpRequest.post("/order/sync/" + id)
    return response.data
}


const issueInvoice = async (id) => {
    // /api/invoice/issue-invoice
    const response = await httpRequest.post("/invoice/issue", {id});
    return response.data
}

const getOrders = async (page = 1, limit = 20, counting = 0) => {
    // localhost:5000/api/order/get-orders
    const response = await httpRequest.get(`/order/get-orders?page=${page}&limit=${limit}&counting=${counting}`)
    return response.data
}


const orderService = {
    orderCreate,
    getOrders,
    issueInvoice,
    syncOrder,
}

export default orderService
