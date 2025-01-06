import httpRequest from '../../utils/request'

/**
 *
 * @param carrier_id
 * @returns {Promise<{}|any>}
 */
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
/**
 *
 * @param total_amount
 * @returns {Promise<{}|any>}
 */
const calcMaxUsagePoint = async(total_amount) => {
    // /api/order/get-max-usage-point
    if(typeof total_amount != "undefined"){
        const response = await httpRequest.get(`/order/get-max-usage-point?total_amount=${total_amount}`)
        return response.data;
    }
    else return {};
}


const discountService = {
    validateCarrierID,
    calcMaxUsagePoint
}
export default discountService;
