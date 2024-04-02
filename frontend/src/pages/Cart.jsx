import {React, useEffect, useState} from "react";
import {
    FaCreditCard,
    FaHome,
    FaMoneyBillAlt, FaShoppingBag,
    FaStoreAlt,
    FaUber
} from "react-icons/fa"
import {Badge, Form} from "react-bootstrap"
import {toast} from "react-toastify";
import {useNavigate, Link} from "react-router-dom";
import {
    clearCart, pointRedeem,
    productSubTotal,
    productTotalAmount,
} from "../features/cart/cartSlice";
import {orderCreate} from "../features/cart/cartSlice";
import {useSelector, useDispatch} from "react-redux";
import CartTable from "../components/CartTable";
import CustomerItem from "../components/CustomerItem";
import Button from "react-bootstrap/Button";
import {clearCustomerValues} from "../features/customer/customerSlice";

const Cart = () => {
    const {selectedCustomer} = useSelector((state) => state.customer);
    const {cartItems, subTotal, totalAmount, order_id, redeem_value, discount_value} = useSelector(
        (state) => state.cart
    );
    const {user} = useSelector((state) => state.auth);

    const dispatch = useDispatch();
    const navigate = useNavigate();

    useEffect(() => {

        if(cartItems.length === 0) navigate("/dashboard/new-order")

        dispatch(productSubTotal());
        dispatch(productTotalAmount());

        if(!order_id)
            dispatch(orderCreate({
                customer: selectedCustomer._id,
                customer_id: selectedCustomer.user_id,
                cartItems,
                subTotal,
                totalAmount,
                payment,
                orderType,
                clerk: user._id,
            }));

    }, [dispatch, cartItems]);

    const [payment, setPayment] = useState("cash");
    const [orderType, setOrderType] = useState("instore");
    const [redeemPoints, setRedeemPoints] = useState(0);


    const cleanupSession = () => {
        dispatch(clearCart());
        dispatch(clearCustomerValues())
        navigate("/dashboard/new-order");
    }

    const handleSubmit = (e) => {
        e.preventDefault();

        // Todo Create order

        // Todo Print invoice

        dispatch(clearCart());
        navigate("/dashboard/orders");
    };

    const handleRedeem = (e) => {
        if(!order_id) return;
        dispatch(pointRedeem({order_id: order_id, points: redeemPoints}));
        dispatch(productTotalAmount());
        e.preventDefault();
    }

    return (
        <div className={"cart-page d-flex"}>
            <section id="cart" className={"p-5"}>
                {(cartItems.length > 0) ? <CartTable dispatch={dispatch} cartItems={cartItems}/> : <div className="info-details">
                    <div className={"icon-info d-flex w-100 justify-content-center flex-row align-items-center"}>
                        <div className="icon">
                            <Link to="/dashboard/new-order">
                                <FaHome className="icon-cart"/>
                            </Link>
                        </div>
                        <span>Return to the main page and add products to the cart.</span>
                    </div>
                </div>
                }
            </section>

            <div className="cart-summary sidebarRight styled mt-4 p-4">

                <Button variant={"danger"} onClick={cleanupSession}>Cleanup Session</Button>
                <CustomerItem customer={selectedCustomer}/>
                <div className={"d-flex flex-row align-items-center justify-content-between border border-warning p-3 bg-warning"}>
                    <span>Order ID: </span><span><Badge pill bg={"warning"}>#{order_id}</Badge></span>
                </div>

                {selectedCustomer.points > 0 ?
                    <div className={"redeem-section mb-4 p-3 border border-warning"}>
                        <Form onSubmit={handleRedeem}>
                            <Form.Group>
                                <Form.Label htmlFor="inputPoints">Redeem Points</Form.Label>
                                <Form.Control
                                    name={"redeemPoints"}
                                    onChange={e => setRedeemPoints(e.target.value)}
                                    value={redeemPoints}
                                    min={0}
                                    max={selectedCustomer.points}
                                    type="number"
                                    id="inputPoints"
                                />
                                <Button variant={"success"} type={"submit"}>Redeem</Button>
                            </Form.Group>
                        </Form>
                    </div> : null}


                <form onSubmit={handleSubmit}>
                    <div className="has-child expand">
                        <div className="content">
                            <div className={"order-type mb-2"}>
                                <div className={"d-flex flex-row"}>
                                            <span className={"mr-2"}>
                                                <input className={"d-none type-select "} id={"instore_type"} checked={orderType === "instore"} onChange={(e) => setOrderType(e.target.value)} type={"radio"} name={"order_type"} value={"instore"}/>
                                                <label className={"btn btn-outline-secondary btn-lg"} htmlFor="instore_type"><FaStoreAlt/> Store</label>
                                            </span>

                                    <span className={"mr-2"}>
                                                <input className={"d-none type-select "} id={"ubereat_type"} checked={orderType === "ubereat"} onChange={(e) => setOrderType(e.target.value)} type={"radio"} name={"order_type"} value={"ubereat"}/>
                                                <label className={"btn btn-outline-secondary btn-lg"} htmlFor="ubereat_type"><FaUber/> Ubereat
                                            </label>
                                            </span>
                                    <span>
                                                <input className={"d-none type-select "} id={"shopee_type"} checked={orderType === "shopee"} onChange={(e) => setOrderType(e.target.value)} type={"radio"} name={"order_type"} value={"shopee"}/>
                                                <label className={"btn btn-outline-secondary btn-lg"} htmlFor="shopee_type"><FaShoppingBag/> Shopee
                                            </label>
                                            </span>


                                </div>
                            </div>

                            <div className="payment-method  mb-3">
                                <div className={"d-flex flex-row"}>
                                            <span className={"mr-2"}>
                                                <input className={"d-none payment-select "} id={"cash_payment"} checked={payment === "cash"} onChange={(e) => setPayment(e.target.value)} type={"radio"} name={"payment"} value={"cash"}/>
                                                <label className={"btn btn-outline-secondary btn-lg"} htmlFor="cash_payment"><FaMoneyBillAlt/> Cash</label>
                                            </span>

                                    <span>
                                                <input className={"d-none payment-select "} id={"credit_payment"} checked={payment === "credit"} onChange={(e) => setPayment(e.target.value)} type={"radio"} name={"payment"} value={"credit"}/>
                                                <label className={"btn btn-outline-secondary btn-lg"} htmlFor="credit_payment"><FaCreditCard/> Credit card
                                            </label>
                                            </span>
                                </div>
                            </div>

                        </div>
                    </div>
                    <div className="cart-total-table p-3">
                        <table>
                            <tbody>
                            <tr>
                                <th>SubTotal:</th>
                                <td>${subTotal}</td>
                            </tr>
                            {discount_value > 0 ? <tr>
                                <th>Discount:</th>
                                <td>-$15</td>
                            </tr> : null}
                            {redeem_value > 0 ? <tr>
                                <th>Redeem:</th>
                                <td>-${parseInt(redeem_value)}</td>
                            </tr> : null}
                            <tr className="grand-total border-top border-warning pt-2">
                                <th>TOTAL:</th>
                                <td>
                                    <strong>${totalAmount}</strong>
                                </td>
                            </tr>
                            <tr><td></td></tr>
                            <tr><td></td></tr>
                            <tr>
                                <td></td>
                                <td>
                                    <Button variant={"warning"} size={"lg"} type="submit">Create Order</Button>
                                </td>
                            </tr>
                            </tbody>
                        </table>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default Cart;
