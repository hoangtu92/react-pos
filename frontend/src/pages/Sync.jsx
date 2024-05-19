import React from "react";
import ProductSync from "../components/ProductSync";
import CustomerSync from "../components/CustomerSync";
import DiscountSync from "../components/DiscountSettingsSync";

const Sync = () => {

    return (
        <>
            <div className={"d-flex w-100"}>
                <div className={"p-5 w-100 d-grid grid column-gap-4 row-gap-4"} style={{gridTemplateColumns: "50% 50%"}}>
                    <ProductSync/>
                    <CustomerSync/>
                    <DiscountSync/>
                </div>
            </div>
        </>
    );
};

export default Sync;
