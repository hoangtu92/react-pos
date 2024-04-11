import { React, useEffect } from "react";
import { addToCart } from "../features/cart/cartSlice";
import { useSelector, useDispatch } from "react-redux";


const ProductItem = ({ product }) => {
  const dispatch = useDispatch();

  const addCart = (product) => {
    dispatch(addToCart(product));
  };

  return (
    <div className="product-cart" onClick={() => {
        addCart(product);
    }}>
      <div className={"image-container"}>
        {product.image ? (
            <img className="product-image" src={"https://justdog.tw/wp-content/uploads/"+ product.image} alt="..." />
        ) : (
            <img
                className="default-image"
                src={require("../images/product.png")}
                alt="..."
            />
        )}
      </div>


      <div className="product-cart-detail">
        <h4>{product.name}</h4>
          <h5>(#{product.sku})</h5>
        <p className="product-price">$ {product.price}</p>
      </div>

    </div>
  );
};

export default ProductItem;
