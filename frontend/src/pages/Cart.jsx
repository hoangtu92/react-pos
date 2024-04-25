import {React, useEffect, useState} from "react";
import {
    FaCheckCircle,
    FaCreditCard, FaEraser,
    FaHome,
    FaMoneyBillAlt, FaPrint, FaShoppingBag,
    FaStoreAlt, FaTrashAlt,
    FaUber
} from "react-icons/fa"
import {Badge, Form, Modal, Spinner} from "react-bootstrap"
import InputGroup from "react-bootstrap/InputGroup"
import {useNavigate, Link} from "react-router-dom";
import {
    batch,
    calcPoint,
    clearCart,
    clearOrder,
    deleteCartItem,
    editCartItem,
    getCart,
    getOrder,
    hideCalculator,
    issueInvoice,
    orderCreate,
    printInvoice,
    productSubTotal,
    productTotalAmount,
    removeOrder,
    updateOrder,
    updateOrderDetail,
    updateSettings,
    validateCarrierID,
} from "../features/cart/cartSlice";
import {useSelector, useDispatch} from "react-redux";
import CartTable from "../components/CartTable";
import CustomerItem from "../components/CustomerItem";
import Button from "react-bootstrap/Button";
import {clearCustomerValues,
    getCustomers,
    handleCustomerChange} from "../features/cart/cartSlice";
import {FaCircleCheck, FaTriangleExclamation} from "react-icons/fa6";
import {toast} from "react-toastify";
import {addCustomer} from "../features/customer/customerSlice";
import SmoothScroll from "../components/SmoothScroll";
import {handleChange} from "../features/product/productSlice";

const Cart = () => {

    const {loading, error, selectedCustomer, coupons, resetCarrierID, cartItems, subTotal, totalAmount, orderObj, order, show_calculator, settings, deletedCartItem, updatedCartItem, needRefreshCart} = useSelector(
        (state) => state.cart
    );
    const {user} = useSelector((state) => state.auth);

    const dispatch = useDispatch();
    const navigate = useNavigate();

    const [carrierId, setCarrierId] = useState("");
    const [receivedCash, setReceiveCash] = useState(0);
    const [customerUpdated, setCustomerUpdated] = useState(false);
    const [showCustomAmountModal, setShowCustomAmountModal] = useState(false);

    useEffect(() => {

        dispatch(productSubTotal());
        dispatch(productTotalAmount());

    }, [dispatch, cartItems, orderObj]);


    useEffect(() => {
        if (typeof orderObj.order_id === 'undefined') {
            dispatch(orderCreate({
                paymentMethod: "cash",
                orderType: "instore",
                clerk: user._id,
            }));
        }
    }, [dispatch, user._id, orderObj.order_id]);


    useEffect(() => {
        if(typeof orderObj.order_id != 'undefined' && orderObj.order_id != null)
            dispatch(getOrder(orderObj.order_id));
    }, [dispatch, orderObj.order_id]);


    useEffect(() => {
        if(resetCarrierID){
            setCarrierId("");
            dispatch(handleChange({name: "resetCarrierID", value: false}));
        }
    }, [dispatch, resetCarrierID]);


    // edit cart justdog
    useEffect(() => {
        if (settings.nonce && settings.nonce.length > 0 && settings.cookie && updatedCartItem) {
            dispatch(editCartItem({nonce: settings.nonce, cart_item: updatedCartItem, cookie: settings.cookie}))
        }
    }, [dispatch, settings.nonce, settings.cookie, updatedCartItem])


    useEffect(() => {
        if (deletedCartItem && settings.cookie) {
            dispatch(deleteCartItem({nonce: settings.nonce, cart_item: deletedCartItem, cookie: settings.cookie}))
        }
    }, [dispatch, settings.nonce, settings.cookie, deletedCartItem])

    // Get cart from justdog
    useEffect(() => {
        if(needRefreshCart)
            dispatch(getCart(settings.cookie));
    }, [dispatch, settings.cookie, needRefreshCart]);

    // Sync cart to justdog.
    useEffect(() => {
        dispatch(batch({nonce: settings.nonce, cartItems: cartItems}));
    }, [dispatch, settings.nonce]);


    useEffect(() => {
        if (typeof orderObj.order_id === "undefined") {
            if (typeof selectedCustomer.user_id === "undefined") showCustomerModal();
        }
    }, [selectedCustomer.user_id, orderObj.order_id]);

    // Update customer when 1 or many field updated
    useEffect(() => {
        setCustomerUpdated(true)
    }, [selectedCustomer.phone, selectedCustomer.name, selectedCustomer.carrier_id, selectedCustomer.buyer_id]);

    const showCustomerModal = () => {
        dispatch(updateSettings({name: "showCustomerModal", value: true}))
    }
    const hideCustomerModal = () => {
        dispatch(updateSettings({name: "showCustomerModal", value: false}))
    }

    /**
     *
     * @param e
     */
    const handleSubmit = (e) => {
        e.preventDefault();

        if(selectedCustomer.is_b2b && (typeof selectedCustomer.buyer_id === 'undefined' || !/[0-9]{8}/.test(selectedCustomer.buyer_id))){
            toast.error("Tax ID is required for B2B Customer")
            return;
        }
        if(orderObj.orderType === "ubereat" && (typeof orderObj.customTotalAmount === 'undefined' || orderObj.customTotalAmount <= 0)){
            toast.error("Custom total amount is required for Ubereat order")
            return;
        }

        dispatch(updateOrder({
            order_id: orderObj.order_id,
            cartItems,
            subTotal,
            totalAmount,
            paymentMethod: orderObj.paymentMethod,
            orderType: orderObj.orderType,
            customTotalAmount: orderObj.customTotalAmount,
            redeemAmount: orderObj.redeem_value,
            redeem_points: orderObj.redeem_points,
            discountAmount: orderObj.discount_value,
            customer: selectedCustomer._id,
            carrier_id: !selectedCustomer.is_b2b ? selectedCustomer.carrier_id : undefined,
            buyer_id: selectedCustomer.is_b2b ? selectedCustomer.buyer_id: undefined,
            enableInvoice: settings.enableInvoice
        }))

    };

    const handleUpdatePayment = (e) => {
        dispatch(updateOrderDetail({name: "paymentMethod", value: e.target.value}));
    }

    const handleUpdateOrderType = (e) => {
        dispatch(updateOrderDetail({name: "orderType", value: e.target.value}));
        if(e.target.value === 'instore'){
            dispatch(updateOrderDetail({name: 'customTotalAmount', value: 0}))
        }
        else{
            if(e.target.value === "ubereat"){
                dispatch(getCustomers({query: "0923110978", order_id: orderObj.order_id}))
            }
            setShowCustomAmountModal(true);
        }
    }

    const onRedeemPointChange = e => {
        if(e.target.value.length > 0)
            dispatch(updateOrderDetail({name: 'redeem_points', value: e.target.value}));
    }
    const handleCalcPointValue = (e) => {
        if(orderObj.redeem_points > 0) dispatch(calcPoint({points: orderObj.redeem_points, customer_id: selectedCustomer.user_id}));
    }

    const handleDiscountValue = e => {
        if(e.target.value.length > 0)
            dispatch(updateOrderDetail({name: "discount_value", value: e.target.value}))
    }

    const cleanupSession = () => {
        dispatch(clearCart())
        dispatch(clearCustomerValues())
        dispatch(removeOrder(orderObj.order_id));
        navigate("/dashboard");
    }


    const finishOrder = () => {
        dispatch(hideCalculator());
        dispatch(clearCustomerValues());
        dispatch(clearCart());
        dispatch(clearOrder());
        navigate("/dashboard");
    }

    const handleBuyerIDChange = (e) => {
        if(selectedCustomer.is_b2b){
            if((typeof e.target.value === 'undefined' || !/^[0-9]{8}$/.test(e.target.value))){
                toast.error("Invalid Tax ID");
            }
            else{
                dispatch(handleCustomerChange({name: "buyer_id" ,value: e.target.value}))
            }
        }
    }

    const handleCarrierIDChange = () => {
        if(carrierId.length > 0){
            dispatch(validateCarrierID(carrierId))
        }
    }

    const handleCloseCustomerModal = e => {
            hideCustomerModal();

        // Todo save customer to database

        if(customerUpdated && /^0[0-9]{9,10}$/.test(selectedCustomer.phone)){
            setCustomerUpdated(false);
            dispatch(addCustomer(selectedCustomer));
        }
    }

    const onHideCustomAmount = e => {

        if(orderObj.orderType === "ubereat" && orderObj.customTotalAmount == 0){
            dispatch(updateOrderDetail({name: "orderType", value: "instore"}));
        }
        setShowCustomAmountModal(false);
    }

    const onCustomerSearch = e => {
        const isValidPhone = (/\d+/.test(e.target.value) && (e.target.value.length === 10 || e.target.value.length === 11));
        if( isValidPhone
            || (/[\w\s]+/.test(e.target.value) && e.target.value.length > 3))
            dispatch(getCustomers({query: e.target.value, order_id: orderObj.order_id}));

        if(isValidPhone){
            dispatch(handleCustomerChange({name: "phone", value: e.target.value}))
        }

    }

    const handlePrintInvoice = () => {
        if(typeof order.invoice !== "undefined")
            dispatch(printInvoice(orderObj.order_id))
        else dispatch(issueInvoice(orderObj.order_id))
    }


    const handleResetCustomerGovID = e => {
        dispatch(handleCustomerChange({name: selectedCustomer.is_b2b ? "buyer_id" : "carrier_id", value: ""}))
    }

    const handleClearRedeem = e => {
        dispatch(updateOrderDetail({name: "redeem_points", value: 0}))
        dispatch(updateOrderDetail({name: "redeem_value", value: 0}))
    }

    return (
        <div className={"cart-page d-flex"}>
            <section id="cart" className={"p-5"}>
                <SmoothScroll>
                    {(cartItems.length > 0) ?
                        <CartTable dispatch={dispatch} order_id={orderObj.order_id} cartItems={cartItems}/> :
                        <div className="info-details">
                            <div className={"icon-info d-flex w-100 justify-content-center flex-row align-items-center"}>
                                <div className="icon">
                                    <Link to="/dashboard">
                                        <FaHome className="icon-cart"/>
                                    </Link>
                                </div>
                                <span>Return to the main page and add products to the cart.</span>
                            </div>
                        </div>
                    }
                </SmoothScroll>
            </section>

            <div className="cart-summary sidebarRight styled mt-4 p-4">

                <form onSubmit={handleSubmit}>

                    <div
                        className={"d-flex flex-row align-items-center justify-content-between border border-warning mb-3 p-2 bg-warning"} style={{borderRadius: 5}}>
                        {loading ? <Spinner animation="border" variant="dark" /> : error ? <FaTriangleExclamation size={32} color={"red"}/> : <FaCheckCircle size={32} color={"green"}/>}

                        <div>
                            <Button variant={"danger"} className={"float-end mb-2"} onClick={cleanupSession}><FaTrashAlt/></Button>
                            <span><Badge pill bg={"warning text-black"}>#{orderObj.order_id}</Badge></span>
                        </div>

                    </div>
                    <CustomerItem onClose={() => dispatch(clearCustomerValues())} onClick={() => showCustomerModal()} customer={selectedCustomer}/>


                    <div className="has-child expand mt-3">
                        <div className="content">
                            <div className={"order-type mb-2"}>
                                <div className={"d-flex flex-row"}>
                                            <span className={"me-2"}>
                                                <input className={"d-none type-select "} id={"instore_type"}
                                                       checked={orderObj.orderType === "instore"}
                                                       onChange={handleUpdateOrderType} type={"radio"}
                                                       name={"order_type"} value={"instore"}/>
                                                <label className={"mb-0 btn btn-outline-secondary btn-lg"}
                                                       htmlFor="instore_type"><FaStoreAlt/> Store</label>
                                            </span>

                                    <span className={"me-2"}>
                                                <input className={"d-none type-select "} id={"ubereat_type"}
                                                       checked={orderObj.orderType === "ubereat"}
                                                       onClick={handleUpdateOrderType} type={"radio"}
                                                       onChange={() => {}}
                                                       name={"order_type"} value={"ubereat"}/>
                                                <label className={"mb-0 btn btn-outline-secondary btn-lg"}
                                                       htmlFor="ubereat_type"><FaUber/> Ubereat
                                            </label>
                                            </span>
                                    <span>
                                                <input className={"d-none type-select "} id={"shopee_type"}
                                                       onChange={e => window.open("https://seller.shopee.tw", "_blank")}
                                                       type={"radio"} name={"order_type"} value={"shopee"}/>
                                                <label className={"mb-0 btn btn-outline-secondary btn-lg"}
                                                       htmlFor="shopee_type"><FaShoppingBag/> Shopee
                                            </label>
                                            </span>


                                </div>
                            </div>

                            <div className="payment-method  mb-4">
                                <div className={"d-flex flex-row"}>
                                            <span className={"me-2"}>
                                                <input className={"d-none payment-select "} id={"cash_payment"}
                                                       checked={orderObj.paymentMethod === "cash"} onChange={handleUpdatePayment}
                                                       type={"radio"} name={"payment"} value={"cash"}/>
                                                <label className={"btn btn-outline-secondary btn-lg"}
                                                       htmlFor="cash_payment"><FaMoneyBillAlt/> Cash</label>
                                            </span>

                                    <span>
                                                <input className={"d-none payment-select "} id={"credit_payment"}
                                                       checked={orderObj.paymentMethod === "credit"}
                                                       onChange={handleUpdatePayment} type={"radio"} name={"payment"}
                                                       value={"credit"}/>
                                                <label className={"btn btn-outline-secondary btn-lg"}
                                                       htmlFor="credit_payment"><FaCreditCard/> Credit card
                                            </label>
                                            </span>
                                </div>
                            </div>

                        </div>
                    </div>
                    <div className="cart-total-table p-3">
                        <table>
                            <tbody>
                            <tr style={orderObj.customTotalAmount > 0 ? {textDecoration: "line-through"} : null}>
                                <th>SubTotal:</th>
                                <td>${subTotal}</td>
                            </tr>
                            {coupons.map(e => {
                                return <tr key={e.code}>
                                    <th>{e.code}</th>
                                    <td>-${e.totals.total_discount}</td>
                                </tr>
                            })}

                            {orderObj.discount_value > 0 ? <tr style={orderObj.customTotalAmount > 0 ? {textDecoration: "line-through"} : null}>
                                <th>Total discount:</th>
                                <td>-${orderObj.discount_value}</td>
                            </tr> : null}
                            {orderObj.redeem_value > 0 ? <tr style={orderObj.customTotalAmount > 0 ? {textDecoration: "line-through"} : null}>
                                <th>Redeem:</th>
                                <td>-${orderObj.redeem_value}</td>
                            </tr> : null}
                            <tr className="grand-total border-top border-warning pt-2" style={orderObj.customTotalAmount > 0 ? {textDecoration: "line-through"} : null}>
                                <th>TOTAL:</th>
                                <td>
                                    <strong>${totalAmount}</strong>
                                </td>
                            </tr>
                            {orderObj.customTotalAmount > 0 ? <tr className="custom-total border-top border-warning pt-2">
                                <th>CUSTOM:</th>
                                <td>
                                    <strong>${orderObj.customTotalAmount}</strong>
                                </td>
                            </tr> : null }
                            <tr>
                                <td></td>
                            </tr>
                            <tr>
                                <td></td>
                            </tr>

                            <tr>
                                <td>
                                    <Form.Group>
                                        <div>
                                            <Form.Check // prettier-ignore
                                                type="switch"
                                                className={"align-items-end flex-row justify-content-end"}
                                                id="issueInvoice"
                                                checked={settings.enableInvoice}
                                                disabled={selectedCustomer.carrier_id.length > 0}
                                                onChange={e => {
                                                    dispatch(updateSettings({name: "enableInvoice", value: e.target.checked}))
                                                }}
                                            />
                                        </div>
                                    </Form.Group>
                                </td>
                                <td><Form.Label htmlFor={"issueInvoice"}>自動印發票</Form.Label></td>
                            </tr>
                            <tr>
                                <td></td>
                                <td>
                                    <Button variant={"warning"} size={"lg"} type="submit" onClick={handleSubmit} disabled={cartItems.length === 0 || loading || error}
                                            className={'d-flex align-items-center'}>
                                        {settings.enableInvoice ? <span><FaPrint className={"me-1"}/> 結帳</span> : <span><FaShoppingBag className={"me-1"}/> 結帳</span> }
                                            </Button>
                                </td>
                            </tr>
                            </tbody>
                        </table>
                    </div>
                </form>
            </div>


            <Modal show={settings.showCustomerModal} backdrop={"static"} size={"lg"}>
                <Form onSubmit={e => {e.preventDefault()}} className={"bg-dark text-white"}>
                    <Modal.Header>
                        <Modal.Title>顧客資訊Customer details</Modal.Title>
                    </Modal.Header>

                    <Modal.Body>

                        <Form.Group className="mb-3" controlId="searchCustomer.ControlInput1">
                            <Form.Label>電話號碼Phone</Form.Label>
                            <Form.Control
                                type="phone"
                                size={"lg"}
                                className={"mb-2"}
                                onChange={onCustomerSearch}
                                placeholder={selectedCustomer.phone}
                                autoFocus
                                onFocus={e => e.target.select()}
                            />

                            <Form.Group>
                                <Form.Label htmlFor={"customerName"}>顧客姓名Name</Form.Label>
                                <Form.Control autoFocus onFocus={e => e.target.select()} id={"customerName"} value={selectedCustomer.name} type={"text"} size={"lg"} onChange={e => dispatch(handleCustomerChange({name: "name", value: e.target.value}))} className={"mb-2"} />
                            </Form.Group>

                        </Form.Group>

                        <div>
                            <Form.Group className="mb-3">
                                <div className={"mb-2"}>
                                    <Form.Check // prettier-ignore
                                        type="switch"
                                        id="b2b"
                                        checked={selectedCustomer.is_b2b}
                                        onChange={e => {
                                            dispatch(handleCustomerChange({name: "is_b2b", value: e.target.checked}))
                                        }}
                                        label="B2B"
                                    />
                                </div>

                                <InputGroup className="mb-3">

                                {selectedCustomer.is_b2b ? <Form.Control
                                    id={"buyer_id"}
                                    type="number"
                                    size={"lg"}
                                    onChange={() => {}}
                                    onBlur={handleBuyerIDChange}
                                    name={"buyer_id"}
                                    onFocus={e => e.target.select()}
                                    placeholder={typeof selectedCustomer.buyer_id != "undefined" && selectedCustomer.buyer_id !== null ? selectedCustomer.buyer_id : "統一編號Buyer Tax ID"}
                                /> : <Form.Control
                                    id={"carrier_id"}
                                    type="text"
                                    size={"lg"}
                                    onChange={(e) => setCarrierId(e.target.value)}
                                    onBlur={handleCarrierIDChange}
                                    onFocus={e => e.target.select()}
                                    value={carrierId}
                                    placeholder={typeof selectedCustomer.carrier_id != "undefined" ? selectedCustomer.carrier_id : "載具號碼Carrier ID"}
                                    name={"carrier_id"}

                                />}

                                <InputGroup.Text id="govid">
                                    <Button variant={"secondary"} onClick={handleResetCustomerGovID}><FaEraser/></Button>
                                    <Button className={"ms-2"} variant={"success"} onClick={handleCarrierIDChange}><FaCircleCheck/></Button>
                                </InputGroup.Text>

                                </InputGroup>
                            </Form.Group>

                            {selectedCustomer.points > 0 ?
                                <Form.Group className={"mb-2"}>
                                    <Form.Label htmlFor="inputPoints" className={"me-2"}>使用狗狗幣Redeem Points
                                        (max: {selectedCustomer.points} points)</Form.Label>
                                    {orderObj.redeem_value > 0 ? <Badge bg="success">Off -NT$ {orderObj.redeem_value}</Badge> : null}
                                    <div className={"d-flex flex-row"}>
                                        <InputGroup>
                                        <Form.Control
                                            name={"redeem_points"}
                                            onChange={onRedeemPointChange}
                                            placeholder={orderObj.redeem_points}
                                            min={0}
                                            size={"lg"}
                                            max={selectedCustomer.points}
                                            type="number"
                                            id="inputPoints"
                                            onFocus={e => e.target.select()}
                                            onBlur={handleCalcPointValue}
                                        />
                                            <InputGroup.Text>
                                                <Button variant={"secondary"} onClick={handleClearRedeem}><FaEraser/></Button>
                                            </InputGroup.Text>
                                        </InputGroup>

                                    </div>

                                </Form.Group> : null}

                            <Form.Group>
                                <Form.Label htmlFor="inputDiscount" className={"me-2"}>折扣Discount</Form.Label>
                                <div className={"d-flex flex-row"}>
                                    <Form.Control
                                        name={"discount_value"}
                                        onChange={handleDiscountValue}
                                        placeholder={orderObj.discount_value}
                                        min={0}
                                        size={"lg"}
                                        max={orderObj.totalAmount}
                                        type="number"
                                        id="inputDiscount"
                                        className={"me-2"}
                                        onFocus={e => e.target.select()}
                                        onBlur={handleDiscountValue}
                                    />

                                </div>

                            </Form.Group>
                        </div>

                    </Modal.Body>

                    <Modal.Footer>
                        <Button size={"lg"} variant="warning" type={"button"} onClick={handleCloseCustomerModal}>Save & Close</Button>
                    </Modal.Footer>
                </Form>
            </Modal>


            <Modal size={"lg"}  show={showCustomAmountModal} backdrop={"static"} onHide={onHideCustomAmount} keyboard={true}>
                <Form  className={"bg-dark text-white"}>
                    <Modal.Header closeButton>
                        <Modal.Title>Custom order amount</Modal.Title>
                    </Modal.Header>

                    <Modal.Body>

                        <Form.Group className="mb-3" controlId="searchCustomer.ControlInput2">
                            <Form.Label>Order Amount</Form.Label>
                            <Form.Control
                                type="number"
                                size={"lg"}
                                min={totalAmount}
                                onChange={(e) => {dispatch(updateOrderDetail({name: 'customTotalAmount', value: e.target.value}))}}
                                onFocus={e => e.target.select()}
                                className={"mb-2"}
                                placeholder={orderObj.customTotalAmount}
                                autoFocus
                            />
                        </Form.Group>

                    </Modal.Body>

                    <Modal.Footer>
                        <Button size={"lg"}  variant="primary" type={"button"} onClick={onHideCustomAmount}>Save & Close</Button>
                    </Modal.Footer>
                </Form>
            </Modal>


            <Modal size={"lg"}  show={show_calculator} backdrop={"static"}>
                <Form  className={"bg-dark text-white"}>
                    <Modal.Header>
                        <Modal.Title className={"text-success"}>訂單完成!</Modal.Title>

                    </Modal.Header>

                    <Modal.Body>
                        <Form.Group className="mb-3" controlId="searchCustomer.ControlInput1">
                            <Form.Label>總金額Total Amount</Form.Label>
                            <Form.Control
                                type="text"
                                size={"lg"}
                                value={"NT$ " + totalAmount}
                                className={"mb-2 bg-warning"}
                                readOnly
                            />
                        </Form.Group>

                        <Form.Group className="mb-3" controlId="searchCustomer.ControlInput2">
                            <Form.Label>收到金額Received Amount</Form.Label>
                            <Form.Control
                                type="number"
                                size={"lg"}
                                value={receivedCash}
                                min={totalAmount}
                                onChange={(e) => {setReceiveCash(e.target.value)}}
                                onFocus={e => e.target.select()}
                                className={"mb-2"}
                                autoFocus
                            />
                        </Form.Group>

                        <Form.Group className="mb-3" controlId="searchCustomer.ControlInput2">
                            <Form.Label>找零Return</Form.Label>
                            <Form.Control
                                type="text"
                                size={"lg"}
                                value={"NT$ " + (receivedCash - totalAmount)}
                                className={"mb-2 bg-success text-white"}
                                readOnly
                            />
                        </Form.Group>
                    </Modal.Body>

                    <Modal.Footer>
                        <Button size={"lg"}  variant={"secondary"} onClick={handlePrintInvoice}><FaPrint/></Button>
                        <Button size={"lg"}  variant="success" type={"button"} disabled={loading} onClick={finishOrder}>Finish</Button>
                    </Modal.Footer>
                </Form>
            </Modal>
        </div>
    );
};

export default Cart;
