import { configureStore } from '@reduxjs/toolkit';
import authReducer from '../features/auth/authSlice'
import productReducer from '../features/product/productSlice'
import customerReducer from '../features/customer/customerSlice'
import cartReducer from '../features/cart/cartSlice'
import orderReducer from '../features/order/orderSlice'
import discountReducer from '../features/discount/discountSlice'

export const store = configureStore({
  reducer: {
    auth: authReducer,
    product: productReducer,
    cart: cartReducer,
    order: orderReducer,
    customer: customerReducer,
    discount: discountReducer
  },
});
