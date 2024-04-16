import { createSlice, createAsyncThunk } from "@reduxjs/toolkit"
import productService from '../product/productService'
import { toast } from 'react-toastify'
import {addToCart} from "../cart/cartSlice";
import {getLocalStorageSettings} from "../../utils/localStorage";

const initialState = {
    products: [],
    filterProduct: [],
    query: "",
    name: '',
    image: '',
    price: '',
    error: false,
    loading: false,
    isEditing: false,
    editProductId: '',
}

export const syncProducts = createAsyncThunk('product/syncProducts', async (_, thunkAPI) => {
    try {
        return await productService.productSync()
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
        }
    },
    extraReducers: (builder) => {
        builder
        .addCase(getProducts.pending, (state) => {
            state.loading = true
        })
        .addCase(getProducts.fulfilled, (state, action) => {
            state.loading = false
            state.products = action.payload;

        })
        .addCase(getProducts.rejected, (state, action) => {
            state.loading = false
            state.error = true
        })
        .addCase(syncProducts.pending, (state) => {
            state.loading = true
        })
        .addCase(syncProducts.fulfilled, (state, action) => {
            state.loading = false
            // update products state
            toast.success('product successfully synced')
        })
        .addCase(syncProducts.rejected, (state, action) => {
            state.loading = false
            state.error = true
        })
    }
})

export const { handleChange, clearValues } = productSlice.actions;
export default productSlice.reducer

