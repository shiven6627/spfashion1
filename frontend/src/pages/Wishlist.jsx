import "./Wishlist.css";
import ProductCard from "../components/ProductCard";
import EmptyState from "../components/EmptyState";

function Wishlist({ wishlist, toggleWishlist, addToCart, products }) {
  const saved = products.filter((product) =>
    wishlist.includes(product.id)
  );

  return (
    <div className="page-shell wishlist-page">
      <div className="shop-heading">
        <h1>Wishlist</h1>
      </div>

      {saved.length === 0 ? (
        <EmptyState
          title="Your wishlist is empty"
          text="Save products you love and find them here later."
          link="/shop"
        />
      ) : (
        <div className="product-grid">
          {saved.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              addToCart={addToCart}
              wishlist={wishlist}
              toggleWishlist={toggleWishlist}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default Wishlist;