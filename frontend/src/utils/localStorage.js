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
    try{
        return JSON.parse(localStorage.getItem('customer'))
    }
    catch(e){
        return null;
    }
}

export const deleteLocalStorageCustomer = () => {
    localStorage.removeItem('customer')
}


export const addLocalStorageOrder = (order) => {
    localStorage.setItem('order', JSON.stringify(order))
}

export const getLocalStorageOrder = () => {
    const order = {paymentMethod: 'cash', orderType: 'instore', redeem_points: 0, discount_value: 0};
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

export const getLocalStorageSettings = () => {
    return JSON.parse(localStorage.getItem('settings'))
}

