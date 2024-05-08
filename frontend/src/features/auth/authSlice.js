import {createSlice, createAsyncThunk} from "@reduxjs/toolkit";
import authService from '../auth/authService'
import {toast} from 'react-toastify'
import {
    addLocalStorageUser,
    getLocalStorageUser,
    deleteLocalStorageUser,
} from '../../utils/localStorage'
import trans from "../../utils/translate";

const user = getLocalStorageUser()

const initialState = {
    user: user ? user : '',
    users: [],
    error: false,
    loading: false,
    message: ''
}

export const register = createAsyncThunk('auth/register', async (user, thunkAPI) => {
    try {
        return await authService.register(user)
    } catch (error) {
        return thunkAPI.rejectWithValue(error.response.data)
    }
})

export const login = createAsyncThunk('auth/login', async (user, thunkAPI) => {
    try {
        return await authService.login(user)
    } catch (error) {
        return thunkAPI.rejectWithValue(error.response.data)
    }
})

export const logout = createAsyncThunk('auth/logout', (_, thunkAPI) => {
    try {
        return authService.logout();
    } catch (error) {
        return thunkAPI.rejectWithValue(error.response.data)
    }
})

export const allUsers = createAsyncThunk('auth/allUsers', (_, thunkAPI) => {
    try {
        return authService.allUsers()
    } catch (error) {
        return thunkAPI.rejectWithValue(error.response.data)
    }
})

export const authSlice = createSlice({
    name: 'auth',
    initialState,
    reducers: {
        reset: (state) => {
            state.loading = false
            state.error = false
            state.message = ''
        }
    },
    extraReducers: (builder) => {
        builder
            .addCase(register.pending, (state) => {
                state.loading = true
            })
            .addCase(register.fulfilled, (state, action) => {
                state.loading = false
                //state.user = action.payload
                //addLocalStorageUser(action.payload)
                toast.success(trans("register_success_msg"))
            })
            .addCase(register.rejected, (state, action) => {
                state.loading = false
                state.error = true
                state.message = action.payload
                state.user = null
            })
            .addCase(login.pending, (state) => {
                state.loading = true
            })
            .addCase(login.fulfilled, (state, action) => {
                state.loading = false
                state.user = action.payload
                addLocalStorageUser(action.payload)
                toast.success(trans("login_success_msg"))
            })
            .addCase(login.rejected, (state, action) => {
                state.loading = false
                state.error = true
                state.message = action.payload
                state.user = null
            })
            .addCase(logout.fulfilled, (state) => {
                state.user = null
                deleteLocalStorageUser()
                toast.success(trans("user_logged_out_msg"))
            })
            .addCase(allUsers.fulfilled, (state, action) => {
                state.users = action.payload
            })
    }
})

export const {reset} = authSlice.actions
export default authSlice.reducer
