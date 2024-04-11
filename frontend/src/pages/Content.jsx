import React, {useEffect, useState} from "react";
import Products from "./Products";
import {useDispatch, useSelector} from "react-redux";
import ShoppingCart from "./ShoppingCart";
import {getProducts} from "../features/product/productSlice";
import ProductSearch from "../components/ProductSearch";
import SmoothScroll from "../components/SmoothScroll";

const Content = () => {

    const dispatch = useDispatch();
    const {settings} = useSelector((state) => state.cart);

    const [query, setQuery] = useState("");

    useEffect(() => {
        dispatch(getProducts(query));
    }, [dispatch, query]);

    return (
        <>
            <div className={"d-flex"}>
                <div className={"p-5 flex-grow-1"}>
                    <ProductSearch dispatch={dispatch} settings={settings}
                                   onChange={e => setQuery(e.target.value)}/>
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
