import { React, useEffect } from "react";
import { addToCart } from "../features/cart/cartSlice";
import { useSelector, useDispatch } from "react-redux";
import {
  productSubTotal,
  productTotalAmount,
} from "../features/cart/cartSlice";

const ProductItem = ({ product }) => {
  const dispatch = useDispatch();

  const addCart = (product) => {
    dispatch(addToCart(product));
  };

  const { cartItems } = useSelector((state) => state.cart);

  useEffect(() => {
    dispatch(productSubTotal());
    dispatch(productTotalAmount());
  }, [dispatch, cartItems]);

  return (
    <div className="product-cart">
      {product.image ? (
        <img className="product-image" src={"https://justdog.tw/wp-content/uploads/"+ product.image} alt="..." />
      ) : (
        <img
          className="default-image"
          src={require("../images/product.png")}
          alt="..."
        />
      )}

      <div className="product-cart-detail">
        <h4>{product.name}</h4>
        <p className="product-price">$ {product.price}</p>
      </div>

      <div className="add-product-cart">
        <button
          className="add-cart"
          type="submit"
          onClick={() => {
            addCart(product);
          }}
        >
          Add to Cart
        </button>
      </div>
    </div>
  );
};

export default ProductItem;
