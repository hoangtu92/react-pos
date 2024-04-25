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
const truncateProduct = async() => {
    //api/product/truncate
    const response = await httpRequest.get("/product/truncate");
    return response.data;
}

const getCarts = async(cookie = "") => {
    //api/product/cart
    const response = await httpRequest.post("/product/cart", {cookie: cookie});
    return response.data;
}

const addCartItem = async(data) => {
    //api/product/addCart
    const response = await httpRequest.post("/product/addCart", data);
    return response.data;
}

const batch = async(data) => {
    //api/product/batch
    const response = await httpRequest.post("/product/batch", data);
    return response.data;
}

const editCartItem = async(data) => {
    //api/product/editCart
    const response = await httpRequest.post("/product/editCart", data);
    return response.data;
}
const removeCartItem = async(data) => {
    //api/product/removeCartItem
    const response = await httpRequest.post("/product/removeCartItem", data);
    return response.data;
}


const productService = {
    productSync,
    getProducts,
    productCount,
    truncateProduct,
    batch,
    getCarts,
    addCartItem,
    editCartItem,
    removeCartItem
}

export default productService
