import "./ProductCard.css";
import { Link } from "react-router-dom";

function ProductCard({ product, addToCart, wishlist = [], toggleWishlist }) {
  const liked = wishlist.includes(product.id);

  return (
    <article className="product-card">
      <div className="product-image">
        <Link to={"/product/" + product.id}>
          <img src={product.image} alt={product.name} />
        </Link>
        <button
          className={"heart" + (liked ? " liked" : "")}
          onClick={() => toggleWishlist(product.id)}
          aria-label={liked ? "Remove from wishlist" : "Add to wishlist"}
        >
          {liked ? "♥" : "♡"}
        </button>
      </div>
      <Link className="product-name" to={"/product/" + product.id}>
        {product.name}
      </Link>
      <div className="price">₹{product.price.toLocaleString("en-IN")}</div>
      <button className="small-btn" onClick={() => addToCart(product)}>
        ADD TO CART
      </button>
    </article>
  );
}

export default ProductCard;
