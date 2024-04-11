import {createSlice, createAsyncThunk} from "@reduxjs/toolkit"
import customerService from "./customerService";
import {toast} from 'react-toastify'


const initialState = {
    error: false,
    loading: false,
}

export const syncCustomers = createAsyncThunk('customer/syncCustomer', async (_, thunkAPI) => {
    try {
        return await customerService.customerSync()
    } catch (error) {
        return thunkAPI.rejectWithValue(error.response.data)
    }
})

export const customerSlice = createSlice({
    name: 'customer',
    initialState,
    reducers: {

    },

    extraReducers: (builder) => {
        builder
            .addCase(syncCustomers.pending, (state) => {
                state.loading = true
            })
            .addCase(syncCustomers.fulfilled, (state, action) => {
                state.loading = false
                // update customers state
                toast.success('customer successfully synced')
            })
            .addCase(syncCustomers.rejected, (state, action) => {
                state.loading = false
                state.error = true
            })
    }
})

//export const {} = customerSlice.actions;
export default customerSlice.reducer

