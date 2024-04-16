import { createSlice, createAsyncThunk } from "@reduxjs/toolkit"
import productService from '../product/productService'
import { toast } from 'react-toastify'
import {addToCart} from "../cart/cartSlice";
import {
    getLocalStorageProductSync,
    getLocalStorageSettings,
    updateLocalStorageProductSync
} from "../../utils/localStorage";

const syncObj = getLocalStorageProductSync();

const initialState = {
    products: [],
    syncObj: syncObj,
    query: "",
    error: false,
    loading: false,
}

export const syncProducts = createAsyncThunk('product/syncProducts', async (args, thunkAPI) => {
    try {
        const result = await productService.productSync(args.page, args.look_back);

        if(result.created.length > 0 || result.updated.length){

            const syncObj = getLocalStorageProductSync();
            if(syncObj.playing){
                const next_page = args.page + 1;
                thunkAPI.dispatch(syncProducts({page: next_page, look_back: args.look_back}))
            }

        }
        return result
    } catch (error) {
        return thunkAPI.rejectWithValue(error.response.data)
    }
})

export const countProducts = createAsyncThunk('product/countProducts', async (_, thunkAPI) => {
    try {

        const syncObj = getLocalStorageProductSync();

        const result = await productService.productCount( syncObj.look_back);

        if(result.total > 0){
            if(syncObj.page > 0){
                thunkAPI.dispatch(syncProducts({page: syncObj.page, look_back: syncObj.look_back}))
            }
            else{
                thunkAPI.dispatch(clearValues())
                thunkAPI.dispatch(syncProducts({page: 1, look_back: syncObj.look_back}))
            }
        }


        return result;
    } catch (error) {
        return thunkAPI.rejectWithValue(error.response.data)
    }
})

export const getProducts = createAsyncThunk('product/getProducts', async (query, thunkAPI) => {
    try {
       const result =  await productService.getProducts(query);
        const settings = getLocalStorageSettings();

        if(settings.scanMode){
            if(result.length === 1){
                thunkAPI.dispatch(addToCart(result[0]));
            }
            else if(result.length === 0 && settings.scanMode){
                toast.warn("無此商品請重新搜尋");
            }
            thunkAPI.dispatch(handleChange({name: "query", value: ""}));
        }


        return result;
    } catch (error) {
         return thunkAPI.rejectWithValue(error.response.data)
    }
})

export const productSlice = createSlice({
    name: 'product',
    initialState,
    reducers: {
     handleChange: (state, { payload: { name, value } }) => {
        state[name] = value
        },
        clearValues: () => {
            return {
                ...initialState,
            }
        },
        updateSyncProduct: (state, {payload: {name, value}}) => {
             state.syncObj[name] = value;
             updateLocalStorageProductSync(state.syncObj);
        }
    },
    extraReducers: (builder) => {
        builder
        .addCase(getProducts.pending, (state) => {
            state.loading = true
        }).addCase(getProducts.fulfilled, (state, action) => {
            state.loading = false
            state.products = action.payload;
        }).addCase(getProducts.rejected, (state, action) => {
            state.loading = false
            state.error = true
        })

        .addCase(syncProducts.pending, (state) => {
        }).addCase(syncProducts.fulfilled, (state, action) => {
            // update products state
            state.syncObj.synced_products += action.payload.total;
            state.syncObj.page = parseInt(action.payload.page);
            state.syncObj.synced_percent = (state.syncObj.synced_products/state.syncObj.total_products)*100;

            if(state.syncObj.synced_percent === 100){
                state.syncObj.page = 1;
                state.syncObj.playing = false;
                if(action.payload.total > 0)
                    toast.success("Product syncing is completed!")
            }
            updateLocalStorageProductSync(state.syncObj);

        }).addCase(syncProducts.rejected, (state, action) => {
            toast.error("Error occurred while syncing!")
        })

        .addCase(countProducts.fulfilled, (state, action) => {
            state.syncObj.total_products = action.payload.total;
            updateLocalStorageProductSync(state.syncObj);
        })
    }
})

export const { handleChange, clearValues, updateSyncProduct } = productSlice.actions;
export default productSlice.reducer

