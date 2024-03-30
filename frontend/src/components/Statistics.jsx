import React, { useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { getOrders } from "../features/order/orderSlice";

const Statistics = () => {
  const dispatch = useDispatch();

  const { products } = useSelector((state) => state.product);
  const { orders } = useSelector((state) => state.order);

  useEffect(() => {
    dispatch(getOrders());

  }, [dispatch]);

  return (
    <>
      <div className="statistic-layout">
        <div className="statistics">
          <span className="statistic-title">Orders</span>
          <div className="statistic-count">
            <div className="image">
              <img src={require("../images/order.png")} alt="..." />
            </div>
            <span>{orders.length}</span>
          </div>
        </div>

        <div className="statistics">
          <span className="statistic-title">Products</span>
          <div className="statistic-count">
            <div className="image">
              <img src={require("../images/products.png")} alt="..." />
            </div>
            <span>{products.length}</span>
          </div>
        </div>
      </div>
    </>
  );
};

export default Statistics;
