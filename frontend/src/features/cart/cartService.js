import httpRequest from '../../utils/request'

const validateCarrierID = async (carrier_id) => {
    // /api/invoice/validate-carrier-id

    if(typeof carrier_id != "undefined"){
        const response = await httpRequest.post("/invoice/validate-carrier-id", {
            carrier_id: carrier_id
        })
        return response.data;
    }
    else return {};
}

const discountService = {
    validateCarrierID
}
export default discountService;
