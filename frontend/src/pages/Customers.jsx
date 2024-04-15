import React from "react";
import { useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import {syncCustomers} from "../features/customer/customerSlice";
import Button from "react-bootstrap/Button";
import {getCustomers} from "../features/cart/cartSlice";
import {syncProducts} from "../features/product/productSlice";

const Customers = () => {

    const {loading, error} = useSelector(
        (state) => state.product
    );
    const dispatch = useDispatch();

  useEffect(() => {
    dispatch(getCustomers());
  }, [dispatch]);

  const syncCustomer = () => {
    dispatch(syncCustomers());
  }
  const syncProduct = () => {
    dispatch(syncProducts());
  }

  return (
    <>
      <div className={"d-flex"}>
        <div className={"p-5 flex-grow-1"}>


            <div className={"mb-3"}>
                <h4>Products</h4>
                <Button onClick={syncProduct}>Sync</Button>
            </div>
            <div>
                <h4>Customers</h4>
                <Button onClick={syncCustomer}>Sync</Button>

            </div>


        </div>
      </div>
    </>
  );
};

export default Customers;
