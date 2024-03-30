import React from "react";
import { useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { getProducts, syncProducts } from "../features/product/productSlice";
import ProductItem from "../components/ProductItem";
import ClipLoader from "react-spinners/ClipLoader";

const Products = () => {
  const { loading, products } = useSelector((state) => state.product);
  const dispatch = useDispatch();

  const sync = () => {
    dispatch(syncProducts());
  }

  useEffect(() => {
    dispatch(getProducts());
  }, [dispatch]);

  const override = {
    display: "block",
    margin: "0 auto",
  };

  if (loading) {
    return <ClipLoader size={60} color="#ecc20e" cssOverride={override} />;
  }

  if (products.length === 0) {
    return (
      <div className="info-details">
        <div className="info">No products found...</div>
        <button onClick={sync}>Sync</button>
      </div>
    );
  }

  return (
    <div className="product-content">
      {products.map((product) => (
        <ProductItem key={product._id} product={product} />
      ))}
    </div>
  );
};

export default Products;
