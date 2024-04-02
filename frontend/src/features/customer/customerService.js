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
const customerService = {
    customerSync,
    getCustomers
}

export default customerService
