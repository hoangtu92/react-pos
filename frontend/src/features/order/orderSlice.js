import { createSlice, createAsyncThunk } from "@reduxjs/toolkit"
import orderService from '../order/orderService'

const initialState = {
    orders: [],
    error: false,
    loading: false,
    order_count: 0,
}

export const getOrders = createAsyncThunk('order/getOrders', async (query, thunkAPI) => {
    try {
       return await orderService.getOrders(query.page, query.limit, query.count)
    } catch (error) {
         return thunkAPI.rejectWithValue(error.response.data)
    }
})

export const orderSlice = createSlice({
    name: 'order',
    initialState,

    extraReducers: (builder) => {
        builder
        .addCase(getOrders.pending, (state) => {
            state.loading = true
        })
        .addCase(getOrders.fulfilled, (state, action) => {
            state.loading = false
            if(Array.isArray(action.payload)){
                state.orders = action.payload
            }
            else if(action.payload){
                state.order_count = action.payload;
            }
        })
        .addCase(getOrders.rejected, (state) => {
            state.loading = false
            state.error = true
        })

    }
})

export default orderSlice.reducer

