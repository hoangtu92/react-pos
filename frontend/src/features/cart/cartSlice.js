import {createAsyncThunk, createSlice} from "@reduxjs/toolkit"
import {
    addLocalStorageCart,
    deleteLocalStorageCart,
    getLocalStorageCart,
    getLocalStorageOrder,
    addLocalStorageOrder,
    deleteLocalStorageOrder,
    getLocalStorageSettings,
    updateLocalStorageSettings,
    setLocalStorageCustomer,
    deleteLocalStorageCustomer, getLocalStorageCustomer, resetLocalStorageSettings
} from '../../utils/localStorage'
import orderService from "../order/orderService";
import {toast} from "react-toastify";
import customerService from "../customer/customerService";
import productService from "../product/productService";

const cartItems = getLocalStorageCart()
const orderObj = getLocalStorageOrder()
const settings = getLocalStorageSettings()
const selectedCustomer = getLocalStorageCustomer();

const initialState = {
    cartItems: cartItems ?? [],
    customers: [],
    selectedCustomer: selectedCustomer,
    orderObj: orderObj,
    order: {},
    totalCount: 0,
    totalAmount: 0,
    subTotal: 0,
    loading: false,
    show_calculator: false,
    settings: settings ?? {scanMode: true, enableInvoice: false},
    addCartItem: false,
    updatedCartItem: false,
    deletedCartItem: false,
    needRefreshCart: false,
    error: false,
    resetCarrierID: false,
    coupons: [],
}

/**
 * Get cart from justdog
 */
export const getCart = createAsyncThunk('cart/get', async (cookie = "", thunkAPI) => {
    try {
        return await productService.getCarts(cookie);
    } catch (error) {
        return thunkAPI.rejectWithValue(error.response.data)
    }
})
/**
 * Add cart item cart to justdog
 */
export const batch = createAsyncThunk('cart/batch', async (data, thunkAPI) => {
    try {
        return await productService.batch(data)
    } catch (error) {
        return thunkAPI.rejectWithValue(error.response.data)
    }
})
/**
 * Add cart item cart to justdog
 */
export const addCart = createAsyncThunk('cart/add', async (data, thunkAPI) => {
    try {
        return await productService.addCartItem(data)
    } catch (error) {
        return thunkAPI.rejectWithValue(error.response.data)
    }
})

/**
 * edit cart item
 */
export const editCartItem = createAsyncThunk('cart/editCartItem', async (data, thunkAPI) => {
    try {
        return await productService.editCartItem(data);
    } catch (error) {
        return thunkAPI.rejectWithValue(error.response.data)
    }
})
/**
 * edit cart item
 */
export const deleteCartItem = createAsyncThunk('cart/deleteCartItem', async (data, thunkAPI) => {
    try {
        return await productService.removeCartItem(data);
    } catch (error) {
        return thunkAPI.rejectWithValue(error.response.data)
    }
})

/**
 * Create new blank order to get order_id reference from justdog.tw
 *
 */
export const orderCreate = createAsyncThunk('order/orderCreate', async (order, thunkAPI) => {
    try {
        return await orderService.orderCreate(order)
    } catch (error) {
        return thunkAPI.rejectWithValue(error.response.data)
    }
})

export const getOrder = createAsyncThunk('order/getOrder', async (order_id, thunkAPI) => {
    try {
        let result = await orderService.getOrder(order_id);

        if(result.status){
            // If local pos order already issue invoice but jd order hasn't completed yet
            if(typeof result.order.invoice !== 'undefined' && typeof result.order.invoice.invno !== 'undefined' && result.jd_order.status !== "completed"){
                // Sync immediately
                thunkAPI.dispatch(syncOrder(order_id))
            }
        }
        return result;
    } catch (error) {
        return thunkAPI.rejectWithValue(error.response.data)
    }
})

export const getCustomers = createAsyncThunk('customer/getCustomers', async (data, thunkAPI) => {
    try {
        const result =  await customerService.getCustomers(data.query);
        if(result.length > 0){
            // Quickly add first customer to the order
            thunkAPI.dispatch(addCustomer({customer_id: result[0].user_id, order_id: data.order_id}))
        }
        else {
            thunkAPI.dispatch(clearCustomerValues());
            if(/^0[0-9]{9,10}$/.test(data.query)){
                thunkAPI.dispatch(handleCustomerChange({name: "phone", value: data.query}));
            }
        }
        return result;
    } catch (error) {
        return thunkAPI.rejectWithValue(error.response.data)
    }
})

// Update customer to order in justdog
export const addCustomer = createAsyncThunk('order/addCustomer', async (data, thunkAPI) => {
    try {
        const result = await orderService.addCustomer(data);
        if(result.status){
            thunkAPI.dispatch(getPoints(data.customer_id));

        }
        return result;
    } catch (error) {
        return thunkAPI.rejectWithValue(error.response.data)
    }
})

// Validate carrier id
export const validateCarrierID = createAsyncThunk('order/validateCarrierID', async (carrier_id, thunkAPI) => {
    try {
        const result =  await orderService.validateCarrierID(carrier_id);
        if(result.status){
            thunkAPI.dispatch(handleCustomerChange({name: "carrier_id" ,value: carrier_id}));
        }
        return result;
    } catch (error) {
        return thunkAPI.rejectWithValue(error.response.data)
    }
})

/**
 * Remove blank order
 *
 */
export const removeOrder = createAsyncThunk('order/removeOrder', async (order_id, thunkAPI) => {
    try {
        const result = await orderService.removeOrder(order_id, thunkAPI);


        thunkAPI.dispatch(clearOrder())
        resetLocalStorageSettings()

        return result;

    } catch (error) {
        return thunkAPI.rejectWithValue(error.response.data)
    }
});

/**
 * Calculate redeem point to credit value
 *
 */
export const calcPoint = createAsyncThunk('coupon/calc', async (data, thunkAPI) => {
    try {
        return await orderService.calcPoint(data);
    } catch (error) {
        return thunkAPI.rejectWithValue(error.response.data)
    }
})

export const getPoints = createAsyncThunk('customer/getPoints', async (customer_id, thunkAPI) => {
    try {
        return await customerService.getPoints(customer_id)
    } catch (error) {
        return thunkAPI.rejectWithValue(error.response.data)
    }
})

/**
 * Update finalization order data to local POS
 *
 */
export const updateOrder = createAsyncThunk('order/updateOrder', async (order, thunkAPI) => {
    try {
        let result = await orderService.updateOrder(order);

        if(result.status){
            if(order.enableInvoice)
                thunkAPI.dispatch(issueInvoice(order.order_id));
            else{
                thunkAPI.dispatch(syncOrder(order.order_id));
            }
        }

        return result;

    } catch (error) {
        return thunkAPI.rejectWithValue(error.response.data)
    }
})

/**
 * Issue invoice after everything is set.
 * Expected behavior: Issue invoice (if hasn't yet) and return the invoice object.
 */
export const issueInvoice = createAsyncThunk('order/issueInvoice', async (order_id, thunkAPI) => {
    try {
        const result =  await orderService.issueInvoice(order_id);

        if(result.status){
            thunkAPI.dispatch(printInvoice(order_id));
            if(typeof result.jObj !== "undefined")
                thunkAPI.dispatch(syncOrder(order_id));
        }

        return result;
    } catch (error) {
        return thunkAPI.rejectWithValue(error.response.data)
    }
})

/**
 *
 * Sync invoice, other order details to justdog.tw
 */
export const syncOrder = createAsyncThunk('order/syncOrder', async (order_id, thunkAPI) => {
    try {
        return await orderService.syncOrder(order_id);

    } catch (error) {
        return thunkAPI.rejectWithValue(error.response.data)
    }
});


export const cartSlice = createSlice({
    name: 'cart',
    initialState,
    reducers: {
        handleChange: (state, { payload: { name, value } }) => {
            state[name] = value
        },
        handleCustomerChange: (state, {payload: {name, value}}) => {
            state.selectedCustomer[name] = value;
            setLocalStorageCustomer(state.selectedCustomer)
        },
        clearCustomerValues: (state) => {
            state.selectedCustomer = {name: "Guest checkout", user_id: "", phone: "", email: "", points: 0, is_b2b: false, carrier_id: "", buyer_id: ""};
            state.customers = [];
            deleteLocalStorageCustomer();
        },
        clearCart: (state) => {
            state.cartItems = [];
            state.show_calculator = false;
            deleteLocalStorageCart();
            state.settings.cookie = null;
            state.needRefreshCart = true;


            updateLocalStorageSettings(state.settings);
        },
        clearOrder: (state) => {
            state.orderObj = {paymentMethod: 'cash', orderType: 'instore', redeem_points: 0, discount_value: 0};
            deleteLocalStorageOrder();
        },
        addToCart: (state, action) => {
            let cartIndex = state.cartItems.findIndex((item) => item.id === action.payload.id)
            // Increasing the quantity of the product
            if (cartIndex >= 0) {
                state.cartItems[cartIndex].quantity += 1
                state.addCartItem = state.cartItems[cartIndex];
            } else {
                // index -1
                // New product to cart add
                const item = {...action.payload, quantity: 1};
                state.cartItems.push({...action.payload, quantity: 1});
                state.addCartItem = item;
            }
            addLocalStorageCart(state.cartItems);

        },
        productSubTotal: (state) => {
            state.subTotal = state.cartItems.reduce((subTotal, product) => {
                const {price, quantity} = product
                return subTotal + price * quantity
            }, 0)
        },
        productTotalAmount: (state) => {
            state.totalAmount = state.subTotal;

            if(typeof state.orderObj.redeem_value != "undefined") state.totalAmount -=  state.orderObj.redeem_value;
            if(typeof state.orderObj.discount_value != "undefined") state.totalAmount -= state.orderObj.discount_value;

            state.totalAmount = Math.round(state.totalAmount);
            if(state.totalAmount < 0) state.error = true;
        },
        increase: (state, action) => {
            const product = state.cartItems.find((item) => item.id === action.payload)
            product.quantity = product.quantity + 1
            addLocalStorageCart(state.cartItems);
            state.updatedCartItem = product;
        },
        decrease: (state, action) => {
            const product = state.cartItems.find((item) => item.id === action.payload)
            if (product.quantity <= 1) {
                product.quantity = 1
            } else {
                product.quantity = product.quantity - 1
            }
            addLocalStorageCart(state.cartItems);
            state.updatedCartItem = product;
        },
        updateSubtotal: (state, {payload: {id, price}}) => {
            const product = state.cartItems.find((item) => item.id === id);
            product.price = price;

            addLocalStorageCart(state.cartItems)
        },
        removeCartItem: (state, action) => {
            if(action.payload.key) state.deletedCartItem =  action.payload;

            state.cartItems = state.cartItems.filter((item) => item.id !== action.payload.id)
            addLocalStorageCart(state.cartItems);

        },
        hideCalculator: (state) => {
            state.show_calculator = false;
        },
        updateOrderDetail: (state, {payload: {name, value}}) => {
            state.orderObj[name] = value;
            addLocalStorageOrder(state.orderObj);
            cartSlice.caseReducers.productTotalAmount(state)
        },
        updateSettings: (state, {payload: {name, value}}) => {
            state.settings[name] = value;
            updateLocalStorageSettings(state.settings)
        },
        printInvoice: (state, {payload: order_id}) => {

            if(typeof order_id === "undefined" || !order_id){
                toast.error("Sorry. There was an error with automate printing function. Please click print manually.")
                return;
            }
            const left = Math.round((document.body.clientWidth - (749/2))/2)
            window.open(`http://localhost:8000/api/invoice/view/${order_id}`, '_blank', 'location=yes,height=609,width=749,left='+left+',top=0,scrollbars=yes,status=yes');
            const msgListener = function (){
                toast.success('Invoice printed successfully!');
                window.removeEventListener("message", msgListener, false);
            }
            window.addEventListener("message", msgListener, false);
        },
        setError: () => {

        }
    },
    extraReducers: (builder) => {
        builder
            .addCase(getCart.pending, (state, action) => {
                state.loading = true;
            })
            .addCase(getCart.fulfilled, (state, action) => {
                state.loading = false;
                state.settings.nonce = action.payload.nonce;
                updateLocalStorageSettings(state.settings);

                state.orderObj.discount_value = action.payload.data.totals.total_discount;

                action.payload.data.items.forEach(e => {
                    const product = state.cartItems.find((item) => item.product_id === e.id)
                    if(product) {
                        product.price = e.prices.price;
                        product.key = e.key;
                    }
                });
                state.coupons = action.payload.data.coupons;
                addLocalStorageCart(state.cartItems);
                addLocalStorageOrder(state.orderObj);
                state.needRefreshCart = false;
            })
            .addCase(batch.fulfilled, (state, action) => {

                state.settings.cookie = action.payload.cookie.reduce((t, e) => {
                    if(/wp_woocommerce_session/.test(e)) t = e;
                    return t;
                }, state.settings.cookie);

                state.needRefreshCart = true;
                state.updatedCartItem = false;
                state.deletedCartItem = false;

            }).addCase(addCart.fulfilled, (state, action) => {
                state.addCartItem = false;
            }).addCase(editCartItem.pending, (state, action) => {
                state.loading = true;
            })
            .addCase(editCartItem.fulfilled, (state, action) => {
                state.updatedCartItem = false;
                state.needRefreshCart = true;
            })

            .addCase(deleteCartItem.fulfilled, (state, action) => {
                state.deletedCartItem = false;
                state.needRefreshCart = true;
            })

            // Create order
            .addCase(orderCreate.pending, (state) => {
                state.loading = true;
            }).addCase(orderCreate.fulfilled, (state, action) => {
                state.loading = false;
                state.error = false;
                state.orderObj.order_id = action.payload.order_id;
                addLocalStorageOrder(state.orderObj);
            }).addCase(orderCreate.rejected, (state) => {
                state.loading = false
                state.error = true
            })
            // update order to local pos
            .addCase(updateOrder.pending, (state) => {
                state.loading = true;
            }).addCase(updateOrder.fulfilled, (state) => {
                state.error = false;
                state.show_calculator = true;
            }).addCase(updateOrder.rejected, (state) => {
                state.loading = false
                state.error = true
            })
            // sync order with justdog
            .addCase(syncOrder.pending, (state) => {
                state.loading = true;
            }).addCase(syncOrder.fulfilled, (state) => {
                state.loading = false;
                state.error = false;
            }).addCase(syncOrder.rejected, (state) => {
                state.loading = false
                state.error = true
            })
            // get order from justdog
            .addCase(getOrder.pending, (state) => {
                state.loading = true;
            }).addCase(getOrder.fulfilled, (state, {payload: result}) => {
                state.loading = false;
                state.error = false;
                state.order = result.order;
                if(!result.jd_order.is_editable){
                    state.show_calculator = true;
                }
            }).addCase(getOrder.rejected, (state) => {
                state.loading = false
                state.error = true
            })
            // Get customer
            .addCase(getCustomers.pending, (state) => {
                state.loading = true
            }).addCase(getCustomers.fulfilled, (state, action) => {
                state.loading = false;
                state.error = false;
                state.customers = action.payload;

                if(state.customers.length > 0){
                    state.selectedCustomer = state.customers[0];
                    setLocalStorageCustomer(state.selectedCustomer)
                }
            }).addCase(getCustomers.rejected, (state) => {
                state.loading = false
                state.error = true
            })

            // Add customer to order in justdog
            .addCase(addCustomer.pending, (state) => {
                state.loading = true
            }).addCase(addCustomer.fulfilled, (state) => {
                state.loading = false;
                state.error = false;
            }).addCase(addCustomer.rejected, (state) => {
                state.loading = false
                state.error = true
            })

            // Remove order
            .addCase(removeOrder.pending, (state) => {
                state.loading = true;
            }).addCase(removeOrder.fulfilled, (state) => {
                state.loading = false;
                state.error = false;
                //toast.success('order successfully deleted')
            }).addCase(removeOrder.rejected, (state) => {
                state.loading = false
                state.error = true
            })

            // Calc point
            .addCase(calcPoint.pending, (state) => {
                state.loading = true;

            }).addCase(calcPoint.rejected, (state, action) => {
                toast.error(action.payload.msg);
                state.loading = false;
                state.orderObj.redeem_points = 0;

            }).addCase(calcPoint.fulfilled, (state, action) => {
                state.loading = false;
                state.error = false;

                if(action.payload.amount > state.totalAmount){
                    toast.error("Exceed total amount");
                    state.orderObj.redeem_value = 0;
                    state.orderObj.redeem_points = 0;
                    addLocalStorageOrder(state.orderObj);
                }
                else{
                    state.orderObj.redeem_value = action.payload.amount;
                    state.orderObj.redeem_points = action.payload.points;
                    cartSlice.caseReducers.productTotalAmount(state, action);
                }

            })

            // Get point
            .addCase(getPoints.pending, (state) => {
                state.loading = true;

            }).addCase(getPoints.rejected, (state) => {
                state.loading = false;
            }).addCase(getPoints.fulfilled, (state, action) => {
                state.loading = false;
                state.error = false;
                state.selectedCustomer.points = action.payload.points;

        })

            // Issue invoice
            .addCase(issueInvoice.pending, (state) => {
                state.loading = true
            }).addCase(issueInvoice.fulfilled, (state, action) => {
                state.error = false;

                if(typeof action.payload.jObj == "undefined"){
                    // Issue order the first time
                    state.loading = false;
                }
            }).addCase(issueInvoice.rejected, (state, action) => {
                state.loading = false
                state.error = true
                toast.error(action.payload.msg)
            })

            .addCase(validateCarrierID.pending, (state) => {
                state.loading = true
                state.error = false
            }).addCase(validateCarrierID.fulfilled, (state, action) => {
                state.loading = false;
                toast.success("Carrier ID is valid");
                state.settings.enableInvoice = false;
                state.selectedCustomer.carrier_id = action.payload.carrier_id
                updateSettings(state.settings);
            }).addCase(validateCarrierID.rejected, (state) => {
                state.loading = false
                state.resetCarrierID = true;
                toast.error("載具號碼錯誤");
            })
    }
})

export const {
    clearCart,
    clearOrder,
    addToCart,
    productSubTotal,
    productTotalAmount,
    increase,
    decrease,
    updateSubtotal,
    removeCartItem,
    hideCalculator,
    updateOrderDetail,
    printInvoice,
    updateSettings,
    handleCustomerChange,
    clearCustomerValues
} = cartSlice.actions;
export default cartSlice.reducer
