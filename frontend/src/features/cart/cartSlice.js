import { createSlice } from "@reduxjs/toolkit"
import { addLocalStorageCart, getLocalStorageCart } from '../../utils/localStorage'

const cartItems = getLocalStorageCart()

const initialState = {
    cartItems: cartItems ? cartItems : [],
    totalCount: 0,
    totalAmount: 0,
    subTotal: 0
}

export const cartSlice = createSlice({
    name: 'cart',
    initialState,
    reducers: {
        clearCart: (state) => {
            state.cartItems = []
        },
        addToCart: (state, action) => {
            let cartIndex = state.cartItems.findIndex((item) => item.id === action.payload.id)
            // Increasing the quantity of the product
            if (cartIndex >= 0) {
                state.cartItems[cartIndex].quantity += 1
            } else {
                // index -1
                // New product to cart add 
                 state.cartItems.push({ ...action.payload, quantity: 1 })
            }
            addLocalStorageCart(state.cartItems)
        },
        productSubTotal: (state, action) => {
            state.subTotal = state.cartItems.reduce((subTotal, product) => {
                const { price, quantity } = product
                    return subTotal + price * quantity    
            }, 0)
        },
        productTotalAmount: (state, action) => {
            state.totalAmount = state.subTotal
        },
        increase: (state, action) => {
            const product = state.cartItems.find((item) => item.id === action.payload)
            product.quantity = product.quantity + 1
            addLocalStorageCart(state.cartItems)
        },
        decrease: (state, action) => {
            const product = state.cartItems.find((item) => item.id === action.payload)
            if (product.quantity <= 1) {
                product.quantity = 1
            } else {
                product.quantity = product.quantity - 1
            }
            addLocalStorageCart(state.cartItems)
        },
        removeCartItem: (state, action) => {
            state.cartItems = state.cartItems.filter((item) => item.id !== action.payload)
            addLocalStorageCart(state.cartItems)
        }
    },
})

export const { clearCart, addToCart, productSubTotal, productTotalAmount, increase, decrease, removeCartItem } = cartSlice.actions;
export default cartSlice.reducer