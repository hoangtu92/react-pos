import React from "react";
import {  useDispatch } from "react-redux";
import {Table} from "react-bootstrap";
import Button from "react-bootstrap/Button";
import {FaPrint} from "react-icons/fa";
import {printInvoice} from "../features/cart/cartSlice";

const OrderItem = ({ order, onClick }) => {

  const dispatch = useDispatch();

  return (
    <div className="order-details" key={order._id} onClick={onClick}>
      <div className="order-title">
        <span className="order-id"><strong>Order Id: # {order.order_id}</strong> (<small className="qta">
          Sold :
            {order.cartItems.reduce((prev, cur) => {
                return prev + cur.quantity;
            }, 0)}
        </small>
)</span>
        <span className="order-time"> Payment: {order.paymentMethod} <br/>
            Clerk: {order.clerks.length > 0 ? order.clerks[0].name : ""}
        </span>
      </div>

      <div className="order-total">

          <Table className={"w-50"} striped bordered hover>
              <tbody>
              {order.cartItems.map(e => <tr key={e._id}>
                  <td><small>{e.name}</small></td>
                  <td><small>x{e.quantity}</small></td>
                  <td><small>${e.price}</small></td>
                  <td><small>${e.price*e.quantity}</small></td>
              </tr>)}
              </tbody>
          </Table>


        <span className="order-price-detail d-flex align-items-center">
          <span className="order-price">$ {order.totalAmount}</span>
          <Button onClick={e => dispatch(printInvoice(order.order_id))}><FaPrint/></Button>
        </span>
      </div>
    </div>
  );
};

export default OrderItem;
