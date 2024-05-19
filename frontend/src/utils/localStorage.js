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
   try{
       return JSON.parse(localStorage.getItem('cart'))
   }
   catch(e){
       return {};
   }
}

export const deleteLocalStorageCart = () => {
   localStorage.removeItem('cart')
}


export const setLocalStorageCustomer = (customer) => {
    localStorage.setItem('customer', JSON.stringify(customer))
}

export const getLocalStorageCustomer = () => {
    const customer = {name: "Guest checkout", user_id: "", phone: "", email: "", points: 0, is_b2b: false, carrier_id: "", buyer_id: ""};
    try{
        let a = JSON.parse(localStorage.getItem('customer'));
        if(a == null) a = customer;
        return a;
    }
    catch(e){
        return customer;
    }
}

export const deleteLocalStorageCustomer = () => {
    localStorage.removeItem('customer')
}


export const addLocalStorageOrder = (order) => {
    localStorage.setItem('order', JSON.stringify(order))
}

export const getLocalStorageOrder = () => {
    const order = {paymentMethod: 'cash', orderType: 'instore', redeem_points: 0, pos_discount: 0, discount_value: 0, discountAmount: 0, totalAmount: 0, subTotal: 0};
    try{
        let a = JSON.parse(localStorage.getItem('order'));
        if(a == null) a = order;
        return a;
    }
    catch(e) {
        return order;
    }
}

export const deleteLocalStorageOrder = () => {
    localStorage.removeItem('order')
}
export const updateLocalStorageSettings = (settings) => {
    localStorage.setItem('settings', JSON.stringify(settings))
}

export const resetLocalStorageSettings = () => {
    localStorage.setItem('settings', JSON.stringify({scanMode: true, enableInvoice: false}))
}



export const getLocalStorageSettings = () => {
    return JSON.parse(localStorage.getItem('settings'))
}


export const updateLocalStorageProductSync = (product_sync) => {
    localStorage.setItem('product_sync', JSON.stringify(product_sync))
}

export const getLocalStorageProductSync = () => {
    let result = JSON.parse(localStorage.getItem('product_sync'));
    return result ?? {total_products: 0, synced_products: 0, synced_percent: 0, page: 1, look_back: 0, playing: false}
}


export const updateLocalStorageCustomerSync = (product_sync) => {
    localStorage.setItem('customer_sync', JSON.stringify(product_sync))
}

export const getLocalStorageCustomerSync = () => {
    let result = JSON.parse(localStorage.getItem('customer_sync'));
    return result ?? {total_customers: 0, synced_customers: 0, synced_percent: 0, page: 1, playing: false}
}

