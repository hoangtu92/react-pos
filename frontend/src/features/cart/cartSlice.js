import {createAsyncThunk, createSlice} from "@reduxjs/toolkit"
import {
    addLocalStorageCart,
    addLocalStorageOrderId, addLocalStorageRedeemValue, deleteLocalStorageCart, deleteLocalStorageOrderId,
    getLocalStorageCart,
    getLocalStorageOrderId, getLocalStorageRedeemValue
} from '../../utils/localStorage'
import orderService from "../order/orderService";
import {toast} from "react-toastify";

const cartItems = getLocalStorageCart()
const order_id = getLocalStorageOrderId()
const redeem_value = getLocalStorageRedeemValue()

const initialState = {
    cartItems: cartItems ?? [],
    order_id: order_id ?? null,
    totalCount: 0,
    totalAmount: 0,
    subTotal: 0,
    redeem_value: redeem_value ?? 0,
    discount_value: 0,
    loading: false,
    error: false
}


export const orderCreate = createAsyncThunk('order/orderCreate', async (order, thunkAPI) => {
    try {
        return await orderService.orderCreate(order)
    } catch (error) {
        return thunkAPI.rejectWithValue(error.response.data)
    }
})

export const pointRedeem = createAsyncThunk('order/redeemPoint', async (data, thunkAPI) => {
    try {
        return await orderService.redeemPoint(data)
    } catch (error) {
        return thunkAPI.rejectWithValue(error.response.data)
    }
})

export const cartSlice = createSlice({
    name: 'cart',
    initialState,
    reducers: {
        clearCart: (state) => {
            state.cartItems = [];
            state.order_id = null;
            deleteLocalStorageCart();
            deleteLocalStorageOrderId();
        },
        addToCart: (state, action) => {
            let cartIndex = state.cartItems.findIndex((item) => item.id === action.payload.id)
            // Increasing the quantity of the product
            if (cartIndex >= 0) {
                state.cartItems[cartIndex].quantity += 1
            } else {
                // index -1
                // New product to cart add
                state.cartItems.push({...action.payload, quantity: 1})
            }
            addLocalStorageCart(state.cartItems)
        },
        productSubTotal: (state, action) => {
            state.subTotal = state.cartItems.reduce((subTotal, product) => {
                const {price, quantity} = product
                return subTotal + price * quantity
            }, 0)
        },
        productTotalAmount: (state, action) => {
            state.totalAmount = state.subTotal - state.redeem_value - state.discount_value;
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
    extraReducers: (builder) => {
        builder
            .addCase(orderCreate.pending, (state) => {
                state.loading = true
            })
            .addCase(orderCreate.fulfilled, (state, action) => {
                state.loading = false
                state.order_id = action.payload.order_id;
                addLocalStorageOrderId(state.order_id);
                toast.success('Order created')
            })
            .addCase(orderCreate.rejected, (state, action) => {
                state.loading = false
                state.error = true
            })
            .addCase(pointRedeem.pending, (state) => {
                state.loading = true;
            })
            .addCase(pointRedeem.fulfilled, (state, action) => {
                state.loading = false;
                state.redeem_value = action.payload.discount_value;
                addLocalStorageRedeemValue(state.redeem_value)
                toast.success(action.payload.msg);
            })
            .addCase(pointRedeem.rejected, (state, action) => {
                state.loading = false;
                toast.error("Error occurred: " + action.payload.msg);
            })
    }
})

export const {
    clearCart,
    addToCart,
    productSubTotal,
    productTotalAmount,
    increase,
    decrease,
    removeCartItem
} = cartSlice.actions;
export default cartSlice.reducer
