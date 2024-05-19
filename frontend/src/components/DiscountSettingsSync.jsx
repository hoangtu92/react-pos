import React from "react";
import {useDispatch, useSelector} from "react-redux";
import Button from "react-bootstrap/Button";
import trans from "../utils/translate";
import {syncDiscount} from "../features/discount/discountSlice";

const DiscountSync = () => {
    const dispatch = useDispatch();
    const {loading, error,} = useSelector(
        (state) => state.discount
    );

    const startSync = () => {
        dispatch(syncDiscount())
    }


    return (
        <>
            <div className={"border-opacity-25 p-4 border-dark border"}>
                <h3 className={"border-bottom border-dark-subtle mb-4 pb-4"}>{trans("discount")}</h3>
                <div className={"d-flex pt-3 pb-3  flex-row align-items-center"}>

                    <div className={"mb-3"}>
                        <Button variant={"primary"} disabled={loading} onClick={startSync}>{trans("start")}</Button>
                    </div>
                </div>
            </div>
        </>
    );
};

export default DiscountSync;
