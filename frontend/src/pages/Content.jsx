import React, {useEffect} from "react";
import Products from "./Products";
import {useDispatch, useSelector} from "react-redux";
import ShoppingCart from "./ShoppingCart";
import {getProducts, handleChange} from "../features/product/productSlice";
import ProductSearch from "../components/ProductSearch";
import SmoothScroll from "../components/SmoothScroll";
import Form from "react-bootstrap/Form";
import {addCart, editCartItem, getCart, updateSettings} from "../features/cart/cartSlice";
import trans from "../utils/translate";

const Content = () => {

    const dispatch = useDispatch();
    const {settings} = useSelector((state) => state.cart);
    const {query} = useSelector((state) => state.product);


    useEffect(() => {
        dispatch(getCart());
    }, [dispatch]);


    useEffect(() => {
        dispatch(getProducts(query));
    }, [dispatch, query]);

    const onSubmit = (e) => {
        e.preventDefault();
        dispatch(handleChange({name: "query", value: e.target.search.value}));
        e.target.reset();
        return false;
    }

    const onChange = (e) => {
        if(!settings.scanMode)
            dispatch(handleChange({name: "query", value: e.target.value}));
    }


    return (
        <>
            <div className={"d-flex"}>
                <div className={"p-5 flex-grow-1"}>
                    <Form.Group>
                        <div className={"mb-2"}>
                            <Form.Check // prettier-ignore
                                type="switch"
                                id="autoCart"
                                checked={settings.scanMode}
                                onChange={e => {
                                    dispatch(updateSettings({name: "scanMode", value: e.target.checked}))
                                }}
                                label={trans("scan_mode")}
                            />
                        </div>
                    </Form.Group>
                    <ProductSearch dispatch={dispatch} settings={settings} onChange={onChange} onSubmit={onSubmit}/>
                    <SmoothScroll>
                        <Products/>
                    </SmoothScroll>
                </div>

                <div className="sidebarRight">
                    <ShoppingCart/>
                </div>

            </div>

        </>
    );
};

export default Content;
