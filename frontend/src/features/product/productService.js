import httpRequest from '../../utils/request'

const productSync = async (page = 0, look_back = 0) => {
    const response = await httpRequest.get(`/product/sync?page=${page}&look_back=${look_back}&count=0`)
    return response.data
}

const productCount = async (look_back) => {
    const response = await httpRequest.get(`/product/sync?look_back=${look_back}&count=1`)
    return response.data
}

const getProducts = async (query) => {
    // localhost:5000/api/product/search
    let url = "/product/search";
    if(query){
        url += "?query=" + query;
    }
    const response = await httpRequest.get(url)
    return response.data
}
const productService = {
    productSync,
    getProducts,
    productCount
}

export default productService
