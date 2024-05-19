import {createSlice, createAsyncThunk} from "@reduxjs/toolkit"
import discountService from "./discountService";
import {toast} from "react-toastify";
import trans from "../../utils/translate";

const initialState = {
    error: false,
    loading: false,
}

export const syncDiscount = createAsyncThunk('discount/sync', async (_, thunkAPI) => {
    try {
        return await discountService.discountSync()
    } catch (error) {
        return thunkAPI.rejectWithValue(error.response.data)
    }
});


export const discountSlice = createSlice({
    name: 'discount',
    initialState,
    reducers: {
        clearValues: () => {
            return {
                ...initialState,
            }
        }
    },

    extraReducers: (builder) => {
        builder
            .addCase(syncDiscount.pending, (state, action) => {
                state.loading = true;

            }).addCase(syncDiscount.fulfilled, (state, action) => {
            toast.success(trans("discount_sync_success"));
            state.loading = false;
            state.error = false;

        }).addCase(syncDiscount.rejected, (state) => {
            state.loading = false;
            state.error = true;
            alert(trans("discount_sync_failed"))
        })

    }
})

export default discountSlice.reducer
