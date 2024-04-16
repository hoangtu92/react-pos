import React, {useEffect, useState} from "react";
import {useDispatch, useSelector} from "react-redux";
import {syncCustomers} from "../features/customer/customerSlice";
import Button from "react-bootstrap/Button";
import {Form, ProgressBar} from "react-bootstrap";
import ProductSync from "../components/ProductSync";

const Sync = () => {
    const dispatch = useDispatch();

    const syncCustomer = () => {
        dispatch(syncCustomers());
    }

    return (
        <>
            <div className={"d-flex w-100"}>
                <div className={"p-5 w-100 d-grid grid column-gap-4 row-gap-4"} style={{gridTemplateColumns: "50% 50%"}}>
                    <ProductSync/>
                    <div className={"border-opacity-25 p-4 border-dark border"}>
                        <h3>Customers</h3>
                        <Button onClick={syncCustomer}>Sync</Button>
                    </div>
                </div>
            </div>
        </>
    );
};

export default Sync;
