import {decrease, increase, removeCartItem, updateItemPrice} from "../features/cart/cartSlice";
import {FaTimes} from "react-icons/fa";
import {React} from "react";
import trans from "../utils/translate";
import {number_format} from "../utils/prototype";

const CartTable = ({cartItems, dispatch}) => {
    return (
        <table className={"mb-5"}>
            <colgroup>
                <col width={"5%"}/>
                <col width={"10%"}/>
                <col width={"40%"}/>
                <col width={"20%"}/>
                <col width={"15%"}/>
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

                        <td style={{textAlign: "left"}}>
                            {product.gifted ? <span>{product.price}</span> :

                            <div className={"flex flex-column"}>

                                {product.regular_qty > 0 ? <small className={"me-1"}>{product.discount ? <del className={"text-danger"}>NT${product.price}</del> : null}
                                    <span className={"text-black"}> NT${number_format(Math.round(product.price - product.discount))} x {product.regular_qty}</span> </small> : null }

                                {product.discount_items.length ? <div>
                                    {product.discount_items.map(item => <small className={"text-black"} key={item.name}>
                                        <del className={"text-danger"}>NT${product.price}</del>
                                        <span className={"text-black"}> NT${item.price > 0 ? number_format(Math.round(item.price - product.discount)) : item.price} x {item.quantity}</span>
                                    </small>)}
                                </div> : null}
                            </div>
                            }

                        </td>

                        <td>
                            {product.gifted ? <span>{product.quantity}</span> : <div className="count">
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
                            </div>}

                        </td>
                        <td>${number_format(Math.round((product.price - product.discount)* product.regular_qty + product.discount_items.reduce((t, e) => {t += t += e.price > 0 ? e.quantity * (e.price - product.discount) : 0;return t;}, 0)))}</td>
                    </tr>
                ))
            ) : null}
            </tbody>
        </table>
    )
}

export default CartTable;
