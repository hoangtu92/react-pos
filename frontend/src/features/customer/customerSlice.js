import {createSlice, createAsyncThunk} from "@reduxjs/toolkit"
import customerService from "./customerService";
import {toast} from 'react-toastify'
import {deleteLocalStorageCustomer, getLocalStorageCustomer, setLocalStorageCustomer} from "../../utils/localStorage";

const selectedCustomer = getLocalStorageCustomer();

const guest = {name: "Guest checkout", phone: "", email: "", points: 0};

const initialState = {
    customers: [],
    selectedCustomer: selectedCustomer ?? guest,
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

export const getCustomers = createAsyncThunk('customer/getCustomers', async (query, thunkAPI) => {
    try {
        return await customerService.getCustomers(query)
    } catch (error) {
        return thunkAPI.rejectWithValue(error.response.data)
    }
})

export const customerSlice = createSlice({
    name: 'customer',
    initialState,
    reducers: {
        memberCheckout: (state) => {
            state.selectedCustomer = state.customers[0];
            setLocalStorageCustomer(state.customers[0])
        },
        guestCheckout: (state) => {
            state.selectedCustomer = {name: "Guest checkout", phone: "", email: "", points: 0};
            setLocalStorageCustomer(state.selectedCustomer)
        },
        handleChange: (state, {payload: {name, value}}) => {
            state[name] = value
        },
        clearCustomerValues: (state) => {
            deleteLocalStorageCustomer();
            return {
                ...initialState,
            }
        }
    },

    extraReducers: (builder) => {
        builder
            .addCase(getCustomers.pending, (state) => {
                state.loading = true
            })
            .addCase(getCustomers.fulfilled, (state, action) => {
                state.loading = false
                state.customers = action.payload
            })
            .addCase(getCustomers.rejected, (state, action) => {
                state.loading = false
                state.error = true
            })
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

export const {handleChange, clearCustomerValues, memberCheckout, guestCheckout} = customerSlice.actions;
export default customerSlice.reducer

