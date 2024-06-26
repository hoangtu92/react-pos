import { React, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  increase,
  decrease,
  productSubTotal,
  productTotalAmount,
  removeCartItem, clearCart,
} from "../features/cart/cartSlice";
import { useSelector, useDispatch } from "react-redux";
import {FaTrashAlt} from "react-icons/fa";
import Button from "react-bootstrap/Button";
import trans from "../utils/translate";
import {number_format} from "../utils/prototype";

const ShoppingCart = () => {
  const { cartItems, orderObj } = useSelector(
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

      <header className={"mb-2 d-flex justify-content-end"}>
        {cartItems.length === 0 ? (
            <div className="cart-empty">
              <div className="cart-title">
                <span>There are no products in the cart.</span>
              </div>
            </div>
        ) : <Button variant={"danger"} className={""} size={"sm"} onClick={() => dispatch(clearCart())}><FaTrashAlt/></Button>}

      </header>


      <div className={"cart-container"}>

        {cartItems ? cartItems.map((cart) => (
              <div className="cart-items mb-2" key={cart.id}>
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
                  <h4 className={"m-0"}>{cart.name}</h4>

                  <button
                      className="remove-item"
                      type="button"
                      onClick={() => {
                        dispatch(removeCartItem(cart));
                      }}
                  >
                    <FaTrashAlt size={14}/>
                  </button>

                  <div className="details">
                    {cart.price > 0 ? <div className="price">
                      {cart.original_price > 0 && cart.price !== cart.original_price ? <del className={"text-secondary pe-2"}>${cart.original_price}</del> : null}<span>${cart.price}</span>
                    </div> : null }

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
          )) : null}

      </div>

      <div className="total-card">
        <div className="total-items">
          <span className="items-count">{trans("items")} ({cartItems.length})</span>
          <span className="items-price">${number_format(orderObj.subTotal)}</span>
        </div>
        <div className="divider"></div>
        <div className="total">
          <span className="total-text">{trans("total")} </span>
          <span className="total-item-price">$ {number_format(orderObj.totalAmount)}</span>
        </div>

        <div className="pay">
          <button disabled={cartItems.length === 0} className="pay-btn" onClick={() => navigate("/dashboard/cart")}>
            {trans("continue")}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ShoppingCart;
