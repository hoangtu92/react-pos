import React from "react";
import { useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { getOrders } from "../features/order/orderSlice";
import OrderItem from "../components/OrderItem";
import SmoothScroll from "../components/SmoothScroll";

const Orders = () => {
  const { orders } = useSelector((state) => state.order);
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(getOrders());
  }, [dispatch]);

  return (
    <>
      <div className={"d-flex"}>
        <SmoothScroll>
          <div className={"p-5"}>
            {orders
                ? orders.map((order) => <OrderItem key={order._id} order={order} />)
                : "Loading..."}
          </div>
        </SmoothScroll>
        <div className="sidebarRight">
        </div>
      </div>
    </>
  );
};

export default Orders;
