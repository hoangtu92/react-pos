import { React, useEffect, useState } from "react";
import { FaHome, FaTimes } from "react-icons/fa";
import { toast } from "react-toastify";
import { useNavigate, Link } from "react-router-dom";
import {
  clearCart,
  increase,
  decrease,
  productSubTotal,
  productTotalAmount,
  removeCartItem,
} from "../features/cart/cartSlice";
import { orderCreate } from "../features/order/orderSlice";
import { useSelector, useDispatch } from "react-redux";
import { deleteLocalStorageCart } from "../utils/localStorage";

const Cart = () => {
  const { cartItems, subTotal, totalAmount } = useSelector(
    (state) => state.cart
  );
  const { user } = useSelector((state) => state.auth);

  const dispatch = useDispatch();
  const navigate = useNavigate();

  useEffect(() => {
    dispatch(productSubTotal());
    dispatch(productTotalAmount());
  }, [dispatch, cartItems]);

  const [phone, setPhone] = useState("");
  const [payment, setPayment] = useState("Cash");

  const handleSubmit = (e) => {
    e.preventDefault();

    const newOrder = {
      phone,
      cartItems,
      subTotal,
      totalAmount,
      payment,
      user: user._id,
    };

    if (phone !== "") {
      dispatch(orderCreate(newOrder));
      dispatch(clearCart());
      deleteLocalStorageCart();
      navigate("/dashboard/orders");
    } else {
      toast.warning("Please fill in the required fields");
    }
  };

  if (cartItems.length === 0) {
    return (
      <div className="info-details">
        <div className="icon-info">
          <div className="icon">
            <Link to="/dashboard">
              <FaHome className="icon-cart" />
            </Link>
          </div>
          <span>Return to the main page and add products to the cart.</span>
        </div>
      </div>
    );
  }

  return (
    <div className="cart-page">
      <div className="cart-container">
        <header className="cart-header">
          <a href="/dashboard" className="logo">
            Shopping Cart
          </a>
          <ul className="navigation">
            <li className="cart-items">Cart Items: {cartItems.length}</li>
          </ul>
        </header>
      </div>

      <div id="shop-container">
        <section id="cart">
          <table>
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
                        <FaTimes />
                      </button>
                    </td>
                    <td>
                      {product.image ? (
                        <img
                          className="product-image"
                          src={"https://justdog.tw/wp-content/uploads/"+ product.image}
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
                    <td>$ {product.price.toFixed(2)}</td>
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
                    <td>$ {(product.price * product.quantity).toFixed(2)}</td>
                  </tr>
                ))
              ) : (
                <div>Products Loading...</div>
              )}
            </tbody>
          </table>
        </section>

        <div className="cart-summary styled">
          <form onSubmit={handleSubmit}>
              <div className="shipping-rate collapse">
                <div className="has-child expand">
                  <h3>CUSTOMER INFORMATION</h3>
                  <div className="content">
                    <div className="payment-method">
                      <div>
                        <label htmlFor="payment">Payment Method</label>
                        <select
                          name="payment"
                          id="payment"
                          value={payment}
                          onChange={(e) => setPayment(e.target.value)}
                        >
                          <option defaultValue="cash">Cash</option>
                          <option defaultValue="credit card">
                            Credit Card
                          </option>
                        </select>
                      </div>
                    </div>

                    <div className="phone">
                      <div>
                        <label htmlFor="phone">Phone Number</label>
                        <input
                          type="tel"
                          name="phone"
                          id="phone"
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                        />
                      </div>
                    </div>

                </div>
              </div>
              <div className="cart-total-table">
                <table>
                  <tbody>
                    <tr>
                      <th>SubTotal:</th>
                      <td>$ {subTotal.toFixed(2)}</td>
                    </tr>
                    <tr className="grand-total">
                      <th>TOTAL:</th>
                      <td>
                        <strong>$ {totalAmount.toFixed(2)}</strong>
                      </td>
                    </tr>
                  </tbody>
                </table>
                <div className="secondary-button">
                  <button type="submit">Create Order</button>
                </div>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Cart;
