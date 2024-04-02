import { React, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  increase,
  decrease,
  productSubTotal,
  productTotalAmount,
  removeCartItem,
} from "../features/cart/cartSlice";
import { useSelector, useDispatch } from "react-redux";
import CustomerItem from "../components/CustomerItem";

const ShoppingCart = ({customer}) => {
  const { cartItems, subTotal, totalAmount } = useSelector(
    (state) => state.cart
  );
  const navigate = useNavigate();
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(productSubTotal());
    dispatch(productTotalAmount());
  }, [dispatch, cartItems]);

  return (
    <div className="cart">

      <CustomerItem customer={customer}/>

        {cartItems.length === 0 && (
            <div className="cart-empty">
          <div className="cart-title">
            <span>There are no products in the cart.</span>
          </div>
            </div>
        )}

      <div className={"cart-container"}>
        {cartItems ? (
            cartItems.map((cart) => (
                <div className="cart-items" key={cart.id}>
                  <div className="image">
                    {cart.image ? (
                        <img className="product-image" src={"https://justdog.tw/wp-content/uploads/"+ cart.image} alt="..." />
                    ) : (
                        <img
                            className="default-image"
                            src={require("../images/product.png")}
                            alt="..."
                        />
                    )}
                  </div>

                  <div className="info">
                    <h4>{cart.name}</h4>

                    <button
                        className="remove-item"
                        type="button"
                        onClick={() => {
                          dispatch(removeCartItem(cart.id));
                        }}
                    >
                      X
                    </button>

                    <div className="details">
                      <div className="price">
                        <p>$ {cart.price}</p>
                      </div>

                      <div className="count">
                        <button
                            className="decrement-btn"
                            type="button"
                            onClick={() => {
                              dispatch(decrease(cart.id));
                            }}
                        >
                          -
                        </button>
                        <span className="amount">{cart.quantity}</span>
                        <button
                            className="increment-btn"
                            type="button"
                            onClick={() => {
                              dispatch(increase(cart.id));
                            }}
                        >
                          +
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
            ))
        ) : (
            <div>Products Loading...</div>
        )}

      </div>

      <div className="total-card">
        <div className="total-items">
          <span className="items-count">Items ({cartItems.length})</span>
          <span className="items-price">$ {subTotal.toFixed(2)}</span>
        </div>
        <div className="divider"></div>
        <div className="total">
          <span className="total-text">Total </span>
          <span className="total-item-price">$ {totalAmount.toFixed(2)}</span>
        </div>

        <div className="pay">
          <button disabled={cartItems.length === 0} className="pay-btn" onClick={() => navigate("/dashboard/cart")}>
            Checkout
          </button>
        </div>
      </div>
    </div>
  );
};

export default ShoppingCart;
