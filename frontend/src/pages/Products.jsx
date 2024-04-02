import React from "react";
import {useEffect} from "react";
import {useSelector, useDispatch} from "react-redux";
import {getProducts, syncProducts} from "../features/product/productSlice";
import ProductItem from "../components/ProductItem";
import ClipLoader from "react-spinners/ClipLoader";
import ProductSearch from "../components/ProductSearch";

const Products = () => {
    const {loading, products} = useSelector((state) => state.product);
    const dispatch = useDispatch();

    const sync = () => {
        dispatch(syncProducts());
    }

    let onChange = (e) => {
        dispatch(getProducts(e.target.value))
    }

    useEffect(() => {
        dispatch(getProducts());
    }, [dispatch]);

    const override = {
        display: "block",
        margin: "0 auto",
    };

    return (
        <div className={"product-container p-5 d-flex flex-column flex-grow-1"}>
            <ProductSearch onChange={onChange}/>
            <div className="product-content">
                {loading ? (
                    <ClipLoader size={60} color="#ecc20e" cssOverride={override}/>
                ) : products.length === 0 ? (
                    <div className="info-details">
                        <div className="info">No products found...</div>
                        <button onClick={sync}>Sync</button>
                    </div>
                ) : products.map((product) => (
                    <ProductItem key={product._id} product={product}/>
                ))
                }

            </div>
        </div>
    )


};

export default Products;
