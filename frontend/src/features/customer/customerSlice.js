import {createSlice, createAsyncThunk} from "@reduxjs/toolkit"
import customerService from "./customerService";
import {toast} from 'react-toastify'
import {handleCustomerChange} from "../cart/cartSlice";
import {
    getLocalStorageCustomerSync,
    updateLocalStorageCustomerSync,
} from "../../utils/localStorage";
import trans from "../../utils/translate";

const syncObj = getLocalStorageCustomerSync();
const initialState = {
    syncObj: syncObj ?? [],
    error: false,
    loading: false,
}

export const syncCustomers = createAsyncThunk('customer/syncCustomer', async (args, thunkAPI) => {
    try {
        const result = await customerService.customerSync(args);

        if(result.created.length > 0 || result.updated.length){

            const syncObj = getLocalStorageCustomerSync();
            if(syncObj.playing){
                const next_page = args.page + 1;
                thunkAPI.dispatch(syncCustomers({page: next_page}))
            }
        }
        return result
    } catch (error) {
        return thunkAPI.rejectWithValue(error.response.data)
    }
});

export const countCustomers = createAsyncThunk('customer/countCustomers', async (_, thunkAPI) => {
    try {

        const syncObj = getLocalStorageCustomerSync();

        const result = await customerService.customerCount();

        if(result.total > 0){
            if(syncObj.page > 0){
                thunkAPI.dispatch(syncCustomers({page: syncObj.page}))
            }
            else{
                thunkAPI.dispatch(clearValues())
                thunkAPI.dispatch(syncCustomers({page: 1}))
            }
        }


        return result;
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
        clearValues: () => {
            return {
                ...initialState,
            }
        },
        updateSyncCustomer: (state, {payload: {name, value}}) => {
            state.syncObj[name] = value;
            updateLocalStorageCustomerSync(state.syncObj);
        }
    },

    extraReducers: (builder) => {
        builder
            .addCase(syncCustomers.fulfilled, (state, action) => {
                state.syncObj.synced_customers += action.payload.total;
                state.syncObj.page = parseInt(action.payload.page);
                state.syncObj.synced_percent = (state.syncObj.synced_customers/state.syncObj.total_customers)*100;

                if(Math.round(state.syncObj.synced_percent) === 100 && action.payload.total === 0){
                    state.syncObj.page = 1;
                    state.syncObj.playing = false;
                    toast.success(trans("customer_sync_success"))
                }
                updateLocalStorageCustomerSync(state.syncObj);

            }).addCase(syncCustomers.rejected, () => {
                alert(trans("customer_sync_failed"))
            })

            .addCase(countCustomers.fulfilled, (state, action) => {
                state.syncObj.total_customers = action.payload.total;
                updateLocalStorageCustomerSync(state.syncObj);
            })

            .addCase(addCustomer.pending, (state) => {
                state.loading = true
            }).addCase(addCustomer.fulfilled, (state) => {
                state.loading = false
                // update customers state
                //toast.success('New customer successfully added')
            }).addCase(addCustomer.rejected, (state) => {
                state.loading = false
                state.error = true
            })

    }
})

export const {updateSyncCustomer, clearValues} = customerSlice.actions;
export default customerSlice.reducer

