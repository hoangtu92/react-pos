import {createSlice, createAsyncThunk} from "@reduxjs/toolkit"
import discountService from "./discountService";

export const syncDiscount = createAsyncThunk('discount/sync', async (_, thunkAPI) => {
    try{
        return await discountService.discountSync()
    }
    catch (error) {
        return thunkAPI.rejectWithValue(error.response.data)
    }
});
