import React from "react";
import {useSelector} from "react-redux";
import ProductItem from "../components/ProductItem";
import ClipLoader from "react-spinners/ClipLoader";
const Products = () => {
    const {loading, products} = useSelector((state) => state.product);

    const override = {
        display: "block",
        margin: "0 auto",
    };

    return (
        <div className={"product-container pt-5 pb-5 d-flex flex-column flex-grow-1 pe-3 ps-3"}>

            <div className="product-content">
                {loading ? (
                    <ClipLoader size={60} color="#ecc20e" cssOverride={override}/>
                ) : products.length === 0 ? (
                    <div className="info-details">
                        <div className="info">No products found...</div>
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
