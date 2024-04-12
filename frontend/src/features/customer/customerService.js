import httpRequest from '../../utils/request'

const customerSync = async () => {
    const response = await httpRequest.get("/customer/sync")
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

const addCustomer = async (customer) => {
    const response = await httpRequest.post("/customer/instant-sync", customer)
    return response.data
}
const customerService = {
    customerSync,
    getCustomers,
    addCustomer,
    getPoints
}

export default customerService
