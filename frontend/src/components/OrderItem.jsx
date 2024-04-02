import React from "react";
import OrderPrint from "../components/OrderPrint";
import { useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";

const OrderItem = ({ order }) => {
  const { user } = useSelector((state) => state.auth);

  const dispatch = useDispatch();
  const navigate = useNavigate();

  return (
    <div className="order-details" key={order._id}>
      <div className="order-title">
        <span className="order-id">Order Id: # {order._id}</span>
        <span className="order-time"> Customer: {order.phone} </span>
      </div>

      <div className="order-total">
        <span className="qta">
          Sold :
          {order.cartItems.reduce((prev, cur) => {
            return prev + cur.quantity;
          }, 0)}
        </span>

        <span className="order-price-detail">
          <span className="order-price">$ {order.totalAmount.toFixed(2)}</span>
          <OrderPrint order={order} />
        </span>
      </div>
    </div>
  );
};

export default OrderItem;
