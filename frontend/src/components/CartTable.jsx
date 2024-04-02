import {decrease, increase, removeCartItem} from "../features/cart/cartSlice";
import {FaTimes} from "react-icons/fa";
import {React} from "react";

const CartTable = ({cartItems, dispatch}) => {
    return (
        <table>
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
                <td>Image</td>
                <td>Product</td>
                <td>Price</td>
                <td>Quantity</td>
                <td>Subtotal</td>
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
                                    dispatch(removeCartItem(product.id));
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
                        <td>{product.name}</td>
                        <td>$ {product.price}</td>
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
                        <td>$ {(product.price * product.quantity)}</td>
                    </tr>
                ))
            ) : (
                <div>Products Loading...</div>
            )}
            </tbody>
        </table>
    )
}

export default CartTable;
