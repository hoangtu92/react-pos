import React, {useState} from "react";
import { useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { getOrders } from "../features/order/orderSlice";
import OrderItem from "../components/OrderItem";
import SmoothScroll from "../components/SmoothScroll";
import NPagination from "../components/Pagination";

const Orders = () => {
  const { orders, order_count } = useSelector((state) => state.order);
  const dispatch = useDispatch();
  const [active, setActive] = useState(1);

  useEffect(() => {
    dispatch(getOrders({
      count: 1
    }));
  }, [dispatch]);

  useEffect(() => {
    if(order_count > 0){
      dispatch(getOrders({page: 0, limit: 20, count: 0}));
    }
  }, [dispatch, order_count]);

  const handleItemClick = (number) => {
    setActive(number);
    dispatch(getOrders({page: number, limit: 20, count: 0}));
  }

  return (
    <>
      <div className={"d-flex"}>
        <SmoothScroll>
          <div className={"p-5"}>
            {orders
                ? orders.map((order) => <OrderItem key={order._id} order={order} />)
                : "Loading..."}
          </div>
          <div className={"p-5"}>
            <NPagination total={order_count/20} onItemClick={handleItemClick} active={active}/>
          </div>
        </SmoothScroll>
        <div className="sidebarRight">
        </div>
      </div>
    </>
  );
};

export default Orders;
