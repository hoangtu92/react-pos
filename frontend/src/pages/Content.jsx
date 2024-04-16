import React, {useEffect, useState} from "react";
import Products from "./Products";
import {useDispatch, useSelector} from "react-redux";
import ShoppingCart from "./ShoppingCart";
import {getProducts} from "../features/product/productSlice";
import ProductSearch from "../components/ProductSearch";
import SmoothScroll from "../components/SmoothScroll";
import {addToCart} from "../features/cart/cartSlice";

const Content = () => {

    const dispatch = useDispatch();
    const {settings} = useSelector((state) => state.cart);
    const {products} = useSelector((state) => state.product);


    const [query, setQuery] = useState("");

    useEffect(() => {
        dispatch(getProducts(query));
    }, [dispatch, query]);

    const onSubmit = (e) => {
        if(products.length > 0)
            dispatch(addToCart(products[0]))
    }


    return (
        <>
            <div className={"d-flex"}>
                <div className={"p-5 flex-grow-1"}>
                    <ProductSearch dispatch={dispatch} settings={settings} onSubmit={onSubmit}
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
