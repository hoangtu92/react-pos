import {decrease, increase, removeCartItem, updateItemPrice} from "../features/cart/cartSlice";
import {FaTimes} from "react-icons/fa";
import {React} from "react";
import {Form} from "react-bootstrap";
import trans from "../utils/translate";

const CartTable = ({cartItems, dispatch}) => {
    return (
        <table className={"mb-5"}>
            <colgroup>
                <col width={"5%"}/>
                <col width={"10%"}/>
                <col width={"40%"}/>
                <col width={"10%"}/>
                <col width={"10%"}/>
                <col width={"15%"}/>
                <col width={"10%"}/>
            </colgroup>
            <thead>
            <tr>
                <td></td>
                <td>{trans("image")}</td>
                <td>{trans("product")}</td>
                <td>{trans("price")}</td>
                <td>{trans("discount")}</td>
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
                            <div className={"item-image"}>
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
                                {product.off > 0 ?<sup>{product.off}% OFF</sup> : null }

                            </div>
                        </td>
                        <td><span className={"text-black-50"}>{product.name}</span> <br/><small><strong>({product.sku})</strong></small>
                            <small className={"ms-2"}>{product.original_price > 0 && product.price != product.original_price ?

                                <span>
                                    <del className={"text-danger pe-2"}>${product.original_price}</del>
                                </span>

                                : <span className={"text-warning"}>${product.original_price}</span>}</small>
                        </td>

                        <td>
                            <Form.Group className={"d-flex flex-row align-items-center"}>
                                <span className={"me-1"}>$ </span><Form.Control onChange={(e) => dispatch(updateItemPrice({id: product.id, price: e.target.value}))} onFocus={e => e.target.select()} type={"number"} value={product.price} />
                        </Form.Group>
                        </td>

                        <td><small>{product.discounts ? product.discounts.map(e => e.name ? `${e.name}: -\$${e.value}` : `-\$${e.value}`).join(", ") : null}</small>
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
                        <td>${(product.price * product.quantity - product.discount)}</td>
                    </tr>
                ))
            ) : null}
            </tbody>
        </table>
    )
}

export default CartTable;
