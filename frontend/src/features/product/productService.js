import httpRequest from '../../utils/request'

const productSync = async () => {
    const response = await httpRequest.get("/product/sync")
    return response.data
}

const getProducts = async () => {
    // localhost:5000/api/product/all-products
    const response = await httpRequest.get("/product/all-products")
    return response.data
}
const productService = {
    productSync,
    getProducts
}

export default productService