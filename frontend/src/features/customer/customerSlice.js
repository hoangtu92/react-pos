import {createSlice, createAsyncThunk} from "@reduxjs/toolkit"
import customerService from "./customerService";
import {toast} from 'react-toastify'
import {handleCustomerChange} from "../cart/cartSlice";


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


export const addCustomer = createAsyncThunk('customer/addCustomer', async (customer, thunkAPI) => {
    try {
        const result = await customerService.addCustomer(customer);
        console.log(result);
        if(result.id){
            thunkAPI.dispatch(handleCustomerChange({name: "user_id", value: result.id}))
        }
        return result;
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
            }).addCase(syncCustomers.fulfilled, (state, action) => {
                state.loading = false
                // update customers state
                toast.success('customer successfully synced')
            }).addCase(syncCustomers.rejected, (state, action) => {
                state.loading = false
                state.error = true
            })

            .addCase(addCustomer.pending, (state) => {
                state.loading = true
            }).addCase(addCustomer.fulfilled, (state, action) => {
                state.loading = false
                // update customers state
                //toast.success('New customer successfully added')
            }).addCase(addCustomer.rejected, (state, action) => {
                state.loading = false
                state.error = true
            })

    }
})

//export const {} = customerSlice.actions;
export default customerSlice.reducer

