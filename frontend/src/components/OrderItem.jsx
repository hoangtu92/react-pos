import React from "react";
import {  useDispatch } from "react-redux";
import {Table} from "react-bootstrap";
import Button from "react-bootstrap/Button";
import {FaPrint, FaSync} from "react-icons/fa";
import {printInvoice, syncOrder} from "../features/cart/cartSlice";
import trans from "../utils/translate";

const OrderItem = ({ order, onClick }) => {

  const dispatch = useDispatch();

  return (
    <div className="order-details" onClick={onClick}>
      <div className="order-title">
        <span className="order-id"><strong>{trans("order_id")}: # {order._id} - #{order.order_id}</strong> (<small className="qta">
          {trans("sold")} :{order.cartItems.reduce((prev, cur) => {
                return prev + cur.quantity;
            }, 0)}
        </small>
)</span>
        <span className="order-time"> {trans("payment")}: {order.paymentMethod} <br/>
            {trans("clerk")}: {order.clerks.length > 0 ? order.clerks[0].name : ""}
        </span>
      </div>

      <div className="order-total">

          <Table className={"w-50"} striped bordered hover>
              <tbody>
              {order.cartItems.map(e => <tr key={e._id + Math.floor(Math.random() * 100) + Math.floor(Math.random() * 100)}>
                  <td><small>{e.name}</small></td>
                  <td><small>x{e.quantity}</small></td>
                  <td><small>${e.price}</small></td>
                  <td><small>${e.price*e.quantity}</small></td>
              </tr>)}
              </tbody>
          </Table>


        <span className="order-price-detail d-flex align-items-center">
          <span className="order-price">$ {order.totalAmount}</span>
          <Button onClick={e => dispatch(printInvoice(order._id))}><FaPrint/></Button>
          <Button className={"ms-2"} onClick={e => dispatch(syncOrder(order._id))}><FaSync/></Button>
        </span>
      </div>
    </div>
  );
};

export default OrderItem;
