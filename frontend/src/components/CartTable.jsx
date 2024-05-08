import {decrease, increase, removeCartItem, updateSubtotal} from "../features/cart/cartSlice";
import {FaTimes} from "react-icons/fa";
import {React} from "react";
import {Form} from "react-bootstrap";
import trans from "../utils/translate";

const CartTable = ({cartItems, dispatch}) => {
    return (
        <table className={"mb-5"}>
            <colgroup>
                <col width={"5%"}/>
                <col width={"15%"}/>
                <col width={"40%"}/>
                <col width={"10%"}/>
                <col width={"20%"}/>
                <col width={"10%"}/>
            </colgroup>
            <thead>
            <tr>
                <td></td>
                <td>{trans("image")}</td>
                <td>{trans("product")}</td>
                <td>{trans("price")}</td>
                <td>{trans("quantity")}</td>
                <td>{trans("subtotal")}</td>
            </tr>
            </thead>
            <tbody>
            {cartItems ? (
                cartItems.map((product) => (
                    <tr key={product.id}>
                        <td>
                            <button
                                type="button"
                                onClick={() => {
                                    dispatch(removeCartItem(product));
                                }}
                            >
                                <FaTimes/>
                            </button>
                        </td>
                        <td>
                            {product.image ? (
                                <img
                                    className="product-image"
                                    src={"https://justdog.tw/wp-content/uploads/" + product.image}
                                    alt="..."
                                />
                            ) : (
                                <img
                                    className="default-image"
                                    src={require("../images/product.png")}
                                    alt="..."
                                />
                            )}
                        </td>
                        <td><span className={"text-black-50"}>{product.name}</span> <br/><small><strong>({product.sku})</strong></small>
                            <small className={"ms-2"}>{product.original_price > 0 && product.price != product.original_price ?

                                <span>
                                    <del className={"text-danger pe-2"}>${product.original_price}</del>
                                    <sup className={"text-success"}> -${product.original_price - product.price} ({Math.round(100*(product.original_price - product.price)/product.original_price)}% OFF)</sup>
                                </span>

                                : <span className={"text-warning"}>${product.original_price}</span>}</small>
                        </td>
                        <td>
                            <Form.Group className={"d-flex flex-row align-items-center"}>
                                <span className={"me-1"}>$ </span><Form.Control onChange={(e) => dispatch(updateSubtotal({id: product.id, price: e.target.value}))} onFocus={e => e.target.select()} type={"number"} value={product.price} />
                        </Form.Group>
                        </td>
                        <td>
                            <div className="count">
                                <button
                                    className="decrement-btn"
                                    type="button"
                                    onClick={() => {
                                        dispatch(decrease(product.id));
                                    }}
                                >
                                    -
                                </button>
                                <span className="amount">{product.quantity}</span>
                                <button
                                    className="increment-btn"
                                    type="button"
                                    onClick={() => {
                                        dispatch(increase(product.id));
                                    }}
                                >
                                    +
                                </button>
                            </div>
                        </td>
                        <td>${(product.price * product.quantity)}</td>
                    </tr>
                ))
            ) : null}
            </tbody>
        </table>
    )
}

export default CartTable;
