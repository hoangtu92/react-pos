import httpRequest from '../../utils/request'



const calcDiscount = async(data) => {
    // /api/discount/calc
    const response = await httpRequest.post("/discount/calc-discount", data);
    return response.data
}

const discountSync = async (args) => {
    const response = await httpRequest.get("/discount/sync-discounts")
    return response.data
}

const discountService = {
    discountSync,
    calcDiscount,
}
export default discountService;
