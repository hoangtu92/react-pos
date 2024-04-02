import { createSlice, createAsyncThunk } from "@reduxjs/toolkit"
import orderService from '../order/orderService'
import { toast } from 'react-toastify'

const initialState = {
    orders: [],
    error: false,
    loading: false,
}


export const getOrders = createAsyncThunk('order/getOrders', async (_, thunkAPI) => {
    try {
       return await orderService.getOrders()
    } catch (error) {
         return thunkAPI.rejectWithValue(error.response.data)
    }
})

export const orderSlice = createSlice({
    name: 'product',
    initialState,
    extraReducers: (builder) => {
        builder
        .addCase(getOrders.pending, (state) => {
            state.loading = true
        })
        .addCase(getOrders.fulfilled, (state, action) => {
            state.loading = false
            state.orders = action.payload
        })
        .addCase(getOrders.rejected, (state, action) => {
            state.loading = false
            state.error = true
        })

    }
})

export default orderSlice.reducer

