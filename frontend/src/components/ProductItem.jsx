import { React } from "react";
import { addToCart } from "../features/cart/cartSlice";
import { useDispatch } from "react-redux";


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
          <h5 className={"text-body-emphasis"}>(#{product.sku})</h5>
        {product.price > 0 ? <p className="product-price">{product.original_price > 0 && product.price !== product.original_price ? <del className={"text-secondary pe-2"}>${product.original_price}</del> : null}${product.price}</p> : null}
      </div>

    </div>
  );
};

export default ProductItem;
