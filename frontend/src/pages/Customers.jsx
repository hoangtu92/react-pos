import React from "react";
import { useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import {getCustomers, syncCustomers} from "../features/customer/customerSlice";
import CustomerItem from "../components/CustomerItem";
import Button from "react-bootstrap/Button";

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
      <h4>Customers</h4>
      <Button onClick={sync}>Sync</Button>
      {customers
        ? customers.map((customer) => <CustomerItem key={customer._id} customer={customer} />)
        : null}
    </>
  );
};

export default Customers;
