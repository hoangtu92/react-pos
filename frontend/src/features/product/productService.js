import httpRequest from '../../utils/request'

const productSync = async () => {
    const response = await httpRequest.get("/product/sync")
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
    getProducts
}

export default productService
