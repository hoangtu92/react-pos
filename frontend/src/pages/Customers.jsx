import React from "react";
import { useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import {syncCustomers} from "../features/customer/customerSlice";
import CustomerItem from "../components/CustomerItem";
import Button from "react-bootstrap/Button";
import {getCustomers} from "../features/cart/cartSlice";

const Customers = () => {
  const { customers } = useSelector((state) => state.customer);
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(getCustomers());
  }, [dispatch]);

  const sync = () => {
    dispatch(syncCustomers());
  }

  return (
    <>
      <div className={"d-flex"}>
        <div className={"p-5 flex-grow-1"}>
      <h4>Customers</h4>
      <Button onClick={sync}>Sync</Button>
      {customers
        ? customers.map((customer) => <CustomerItem key={customer._id} customer={customer} />)
        : null}
        </div>
      </div>
    </>
  );
};

export default Customers;
