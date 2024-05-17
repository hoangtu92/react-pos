import httpRequest from '../../utils/request'


const discountSync = async () => {
    const response = await httpRequest.get("/discount/get-discount-rules")
    return response.data
}

const calcDiscount = async(data) => {
    // /api/discount/calc
    const response = await httpRequest.post("/discount/calc-discount", data);
    return response.data
}

const discountService = {
    discountSync,
    calcDiscount
}
export default discountService;
