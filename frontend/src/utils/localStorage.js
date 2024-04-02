export const addLocalStorageUser = (user) => {
    localStorage.setItem('user', JSON.stringify(user))
}

export const getLocalStorageUser = () => {
   return JSON.parse(localStorage.getItem('user'))
}

export const deleteLocalStorageUser = () => {
   localStorage.removeItem('user')
}

export const addLocalStorageCart = (product) => {
    localStorage.setItem('cart', JSON.stringify(product))
}

export const getLocalStorageCart = () => {
   return JSON.parse(localStorage.getItem('cart'))
}

export const deleteLocalStorageCart = () => {
   localStorage.removeItem('cart')
}


export const setLocalStorageCustomer = (customer) => {
    localStorage.setItem('customer', JSON.stringify(customer))
}

export const getLocalStorageCustomer = () => {
    return JSON.parse(localStorage.getItem('customer'))
}

export const deleteLocalStorageCustomer = () => {
    localStorage.removeItem('customer')
}


export const addLocalStorageOrderId = (order_id) => {
    localStorage.setItem('order_id', order_id)
}

export const getLocalStorageOrderId = () => {
    return localStorage.getItem('order_id')
}

export const deleteLocalStorageOrderId = () => {
    localStorage.removeItem('order_id')
}
export const addLocalStorageRedeemValue = (order_id) => {
    localStorage.setItem('redeem_value', order_id)
}

export const getLocalStorageRedeemValue = () => {
    return localStorage.getItem('redeem_value')
}

export const deleteLocalStorageRedeemValue = () => {
    localStorage.removeItem('redeem_value')
}

