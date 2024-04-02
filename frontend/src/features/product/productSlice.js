import { createSlice, createAsyncThunk } from "@reduxjs/toolkit"
import productService from '../product/productService'
import { toast } from 'react-toastify'

const initialState = {
    products: [],
    filterProduct: [],
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
       return await productService.getProducts(query)
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
            state.products = action.payload
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

