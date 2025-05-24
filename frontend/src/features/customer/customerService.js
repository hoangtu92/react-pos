import httpRequest from '../../utils/request'

const customerSync = async (args) => {
    const response = await httpRequest.get(`/customer/sync?count=0&page=${args.page}&look_back=${args.look_back}`)
    return response.data
}

const customerCount = async (look_back) => {
    const response = await httpRequest.get(`/customer/sync?look_back=${look_back}&count=1`)
    return response.data
}

const getCustomers = async (query) => {
    // localhost:5000/api/customer/search
    let url = "/customer/search";
    if(query){
        url += "?query=" + query;
    }
    const response = await httpRequest.get(url)
    return response.data
}

const getPoints = async (customer_id) => {
    // localhost:5000/api/coupon/points
    const response = await httpRequest.get("/customer/points?customer_id=" + customer_id)
    return response.data
}

const calcPoint = async(points) => {
    // /api/coupon/calc
    const response = await httpRequest.get("/customer/calc-points?points=" + points);
    return response.data
}

const addUpdateCustomer = async (data) => {
    // localhost:5000/api/order/add-order
    const response = await httpRequest.post("/customer/add-update-customer", data)
    return response.data
}
const customerService = {
    customerSync,
    getCustomers,
    addUpdateCustomer,
    getPoints,
    customerCount,
    calcPoint
}

export default customerService
