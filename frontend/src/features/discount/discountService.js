import httpRequest from '../../utils/request'


const discountSync = async () => {
    const response = await httpRequest.get("/discount/get-discount-rules")
    return response.data
}

const discountService = {
    discountSync
}
export default discountService;
