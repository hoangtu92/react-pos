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
    deleteLocalStorageCustomer, getLocalStorageCustomer
} from '../../utils/localStorage'
import orderService from "../order/orderService";
import {toast} from "react-toastify";
import customerService from "../customer/customerService";
import trans from "../../utils/translate";
import cartService from "./cartService";
import discountService from "../discount/discountService";
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
    loading: false,
    show_calculator: false,
    settings: settings ?? {scanMode: true, enableInvoice: false, language: "tw"},
    addCartItem: false,
    updatedCartItem: true,
    deletedCartItem: false,
    needRefreshCart: false,
    error: false,
    resetCarrierID: false,
    coupons: [],
}

/**
 * Create new blank order to get order_id reference from justdog.tw
 *
 */
export const orderCreate = createAsyncThunk('order/orderCreate', async (order, thunkAPI) => {
    try {
        const result = await orderService.orderCreate(order);

        if(result.status){
            if(order.enableInvoice)
                thunkAPI.dispatch(issueInvoice({id: result.data._id, print: !order.carrier_id}));
            else{
                thunkAPI.dispatch(syncOrder(result.data._id));
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
        if(result.length == 0){
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
export const addUpdateCustomer = createAsyncThunk('order/addUpdateCustomer', async (data, thunkAPI) => {
    try {
        return await customerService.addUpdateCustomer(data);
    } catch (error) {
        return thunkAPI.rejectWithValue(error.response.data)
    }
})

// Validate carrier id
export const validateCarrierID = createAsyncThunk('order/validateCarrierID', async (carrier_id, thunkAPI) => {
    try {
        return  await cartService.validateCarrierID(carrier_id);
    } catch (error) {
        return thunkAPI.rejectWithValue(error.response.data)
    }
})

/**
 * Calculate redeem point to credit value
 *
 */
export const calcPoint = createAsyncThunk('coupon/calc', async (points, thunkAPI) => {
    try {
        return await customerService.calcPoint(points);
    } catch (error) {
        return thunkAPI.rejectWithValue(error.response.data)
    }
});

export const apply_bxgy_discount = createAsyncThunk('product/get_ids', async (bxgy, thunkAPI) => {
    try {
        return await productService.getProductsByIds(bxgy);
    } catch (error) {
        return thunkAPI.rejectWithValue(error.response.data)
    }
});

/**
 * Calculate discount
 *
 */
export const calculateDiscount = createAsyncThunk('discount/calc', async (data, thunkAPI) => {
    try {
        const result = await discountService.calcDiscount(data);

        if(result.orderObj.bxgy_items){
            result.orderObj.bxgy_items.map(e => thunkAPI.dispatch(apply_bxgy_discount(e)))
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
export const issueInvoice = createAsyncThunk('order/issueInvoice', async (data, thunkAPI) => {
    try {
        const result =  await orderService.issueInvoice(data.id);

        if(result.status){
            if(data.print) {
                thunkAPI.dispatch(printInvoice(data.id));
            }

            thunkAPI.dispatch(syncOrder(data.id))
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
export const syncOrder = createAsyncThunk('order/syncOrder', async (id, thunkAPI) => {
    try {
        return await orderService.syncOrder(id);

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
            state.resetCarrierID = false;
            setLocalStorageCustomer(state.selectedCustomer)
        },
        clearCustomerValues: (state) => {
            state.selectedCustomer = {name: "Guest checkout", user_id: "", phone: "", email: "", points: 0, is_b2b: false, carrier_id: "", buyer_id: ""};
            state.customers = [];
            deleteLocalStorageCustomer();
        },
        clearCart: (state) => {
            state.cartItems = [];
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
                state.cartItems.push({...action.payload, quantity: 1, discount: 0, discount_items: [], regular_qty: 0, discounted_qty: 0, off: Math.round(100*(action.payload.original_price - action.payload.price)/action.payload.original_price)});
                state.addCartItem = item;
            }
            addLocalStorageCart(state.cartItems);
            state.updatedCartItem = true;

        },
        productSubTotal: (state) => {
            state.orderObj.subTotal = Math.round(state.cartItems.reduce((subTotal, product) => {
                const {price, regular_qty, quantity, discount} = product;
                const discounted_item_subtotal = product.discount_items.reduce((t, e) => {
                    t += e.price > 0 ? e.quantity * (e.price - discount) : 0;
                    return t;
                    }, 0);

                subTotal += discounted_item_subtotal ? discounted_item_subtotal + (price  - discount) * regular_qty : (price  - discount) * quantity;
                return subTotal;
            }, 0));

            state.cartItems.map(e => {
                e.price_after_discount = e.price - e.discount
                return e;
            })
        },
        productTotalAmount: (state) => {
            state.orderObj.totalAmount = state.orderObj.subTotal;

            if(state.orderObj.redeem_value) state.orderObj.totalAmount -=  state.orderObj.redeem_value;
            if(state.orderObj.discountAmount ) state.orderObj.totalAmount -= state.orderObj.discountAmount;

            state.orderObj.totalAmount = Math.round(state.orderObj.totalAmount);

            state.error = state.orderObj.totalAmount < 0;
        },
        increase: (state, action) => {
            const product = state.cartItems.find((item) => item.id === action.payload)
            product.quantity = product.quantity + 1
            addLocalStorageCart(state.cartItems);
            state.updatedCartItem = true;
        },
        decrease: (state, action) => {
            const product = state.cartItems.find((item) => item.id === action.payload)
            if (product.quantity <= 1) {
                product.quantity = 1
            } else {
                product.quantity = product.quantity - 1
            }
            addLocalStorageCart(state.cartItems);
            state.updatedCartItem = true;
        },
        updateItemPrice: (state, {payload: {id, price}}) => {
            const product = state.cartItems.find((item) => item.id === id);
            product.price = price;
            product.off = Math.round(100*(product.original_price - product.price)/product.original_price);

            addLocalStorageCart(state.cartItems);
            state.updatedCartItem = true;
        },
        removeCartItem: (state, action) => {
            if(action.payload.key) state.deletedCartItem =  action.payload;

            state.cartItems = state.cartItems.filter((item) => item.id !== action.payload.id)
            addLocalStorageCart(state.cartItems);
            state.updatedCartItem = true;
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
        printInvoice: (state, {payload: id}) => {

            if(typeof id === "undefined" || !id){
                alert(trans("auto_print_error_msg"))
                return;
            }
            const left = Math.round((document.body.clientWidth - (749/2))/2);
            window.open(`http://localhost:8000/api/invoice/view/${id}`, '_blank', 'location=yes,height=609,width=749,left='+left+',top=0,scrollbars=yes,status=yes');
            const msgListener = function (){
                toast.success(trans("print_success_msg"));
                window.removeEventListener("message", msgListener, false);
            }
            window.addEventListener("message", msgListener, false);
        },
        validateBuyerID: (state, {payload: buyerID}) => {
            if(state.selectedCustomer.is_b2b){
                if((!/^[0-9]{8}$/.test(buyerID))){
                    alert(trans("invalid_tax_id_msg"));
                    state.error = true;
                }
                else{
                    state.error = false;
                    state.selectedCustomer.buyer_id = buyerID;
                    setLocalStorageCustomer(state.selectedCustomer)
                }
            }
        }
    },
    extraReducers: (builder) => {
        builder
            // Create order
            .addCase(orderCreate.pending, (state) => {
                state.loading = true;
            }).addCase(orderCreate.fulfilled, (state, action) => {

                state.orderObj.id = action.payload.data._id;
                addLocalStorageOrder(state.orderObj)

                toast.success(trans("order_create_success"))
            }).addCase(orderCreate.rejected, (state) => {
                state.error = true
            })
            // sync order with justdog
            .addCase(syncOrder.pending, (state) => {
                state.loading = true;
            }).addCase(syncOrder.fulfilled, (state) => {
                state.loading = false;
                state.error = false;
                toast.success(trans("order_sync_success"));
            }).addCase(syncOrder.rejected, (state) => {
                state.loading = false
                state.error = true;
                alert(trans("order_sync_failed"))
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

            .addCase(addUpdateCustomer.pending, (state) => {
                state.loading = true
            }).addCase(addUpdateCustomer.fulfilled, (state, action) => {
                state.loading = false;
                state.error = false;
                state.selectedCustomer._id = action.payload.data._id;
                setLocalStorageCustomer(state.selectedCustomer)
            }).addCase(addUpdateCustomer.rejected, (state) => {
                state.loading = false
                state.error = true
            })
            // Calc point
            .addCase(calcPoint.pending, (state) => {
                state.loading = true;

            }).addCase(calcPoint.rejected, (state, action) => {
                alert(trans(action.payload.msg));
                state.loading = false;
                state.orderObj.redeem_points = 0;

            }).addCase(calcPoint.fulfilled, (state, action) => {
                state.loading = false;
                state.error = false;

                if(action.payload.amount > state.orderObj.totalAmount){
                    alert(trans("redeem_amount_exceed_total_error"));
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



            // Issue invoice
            .addCase(issueInvoice.fulfilled, (state, action) => {
                state.error = false;
                state.orderObj.invoice = action.payload.invoice
                addLocalStorageOrder(state.orderObj);
                toast.success(trans("invoice_issued_success"))

            }).addCase(issueInvoice.rejected, (state, action) => {
                state.loading = false
                state.error = true
                alert(action.payload.msg)
            })

            .addCase(validateCarrierID.pending, (state) => {
                state.loading = true
                state.error = false
            }).addCase(validateCarrierID.fulfilled, (state, action) => {
                state.loading = false;
                toast.success(trans("carrier_id_validate_success"));
                state.selectedCustomer.carrier_id = action.payload.carrier_id
                updateSettings(state.settings);
                setLocalStorageCustomer(state.selectedCustomer);
            }).addCase(validateCarrierID.rejected, (state) => {
                state.loading = false
                state.resetCarrierID = true;
                alert(trans("carrier_id_validate_failed"));
            })

            .addCase(calculateDiscount.pending, (state) => {
                state.loading = true
                state.error = false
            }).addCase(calculateDiscount.fulfilled, (state, action) => {
                state.loading = false;
                if(action.payload.cartItems){
                    state.cartItems = action.payload.cartItems
                }
                if(action.payload.orderObj){
                    state.orderObj = action.payload.orderObj;
                }
                state.orderObj.pos_discount = state.orderObj.pos_discount ?? 0;
                state.orderObj.discount_value = state.orderObj.discount_value ?? 0;

                state.orderObj.discountAmount = Math.round(parseFloat(state.orderObj.discount_value) + parseInt(state.orderObj.pos_discount))
                state.updatedCartItem = false;
                //toast.success(trans("discount_applied_success"));

            }).addCase(calculateDiscount.rejected, (state) => {
                state.loading = false
                //alert(trans("discount_applied_failed"));
            })

            .addCase(apply_bxgy_discount.pending, (state) => {
                state.loading = true
                state.error = false
            }).addCase(apply_bxgy_discount.fulfilled, (state, action) => {
                state.loading = false;
                const bxgy = action.payload;
                if(bxgy.items){
                    bxgy.items.map(e => {

                        let item_discount_value;

                        e.id = (Math.floor(Math.random() * 100) + 1) + e.id + "_bxgy";
                        e.name = "[BXGY] " + e.name;
                        e.gifted = true;
                        e.quantity = bxgy.qty;
                        e.discounts = e.discounts || [];
                        e.discount = 0;
                        e.discounted_qty = 0;
                        e.discount_items = [];

                        if(bxgy.type === "free_product"){
                            e.price = 0;
                        }
                        else {
                            if (bxgy.type === "percentage") {
                                item_discount_value = (bxgy.value * (e.price - e.discount)) / 100
                            } else if (bxgy.type === "flat") {
                                item_discount_value = parseInt(bxgy.value);

                            } else if (bxgy.type === "fixed_price") {
                                item_discount_value = e.price - bxgy.value
                            }

                            e.discounts.push({
                                name: bxgy.name,
                                value: Math.floor(item_discount_value),
                                adjust: {type: bxgy.type, value: bxgy.value}
                            });

                            e.discount = Math.floor(e.discounts.reduce((t, e) => {
                                t += e.value;
                                return t;
                            }, 0));
                        }



                        return e;
                    });

                    state.cartItems = state.cartItems.concat(bxgy.items);
                }

            }).addCase(apply_bxgy_discount.rejected, (state) => {
                state.loading = false
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
    updateItemPrice,
    removeCartItem,
    hideCalculator,
    updateOrderDetail,
    printInvoice,
    updateSettings,
    handleCustomerChange,
    clearCustomerValues,
    validateBuyerID,
    handleChange
} = cartSlice.actions;
export default cartSlice.reducer
