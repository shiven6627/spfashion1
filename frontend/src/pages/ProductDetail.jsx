import "./ProductDetail.css";
import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import SectionTitle from "../components/SectionTitle";
import ProductCard from "../components/ProductCard";
import NotFound from "./NotFound";
import { products } from "../data/products";

function ProductDetail({ addToCart, wishlist, toggleWishlist, products: catalogProducts }) {
  const { id } = useParams();
  const product = (catalogProducts || products).find((item) => String(item.id) === String(id));
  const [quantity, setQuantity] = useState(1);

  if (!product) {
    return <NotFound />;
  }

  const liked = wishlist.includes(product.id);

  function addProduct() {
    for (let i = 0; i < quantity; i += 1) {
      addToCart(product);
    }
  }

  const related = (catalogProducts || products)
    .filter(
      (item) =>
        item.category === product.category &&
        item.id !== product.id
    )
    .slice(0, 4);

  return (
    <div className="page-shell">
      <div className="detail">

        <div className="detail-image">
          <img src={product.image} alt={product.name} />
        </div>

        <div className="detail-info">

          <div className="muted">
            {product.category}
          </div>

          <h1>{product.name}</h1>

          <div className="product-id">
            S id: SM/{String(product.id).padStart(2, "0")}
          </div>

          <h2>
            ₹{product.price.toLocaleString("en-IN")}
          </h2>

          <div className="tax-text">
            MRP inclusive of all taxes
          </div>

          <div className="product-meta">
            <p>
              <span>Color:</span> {product.color}
            </p>

            <p>
              <span>Availability:</span>{" "}
              <strong>In Stock</strong>
            </p>
          </div>

          <div className="quantity-title">
            Quantity:
          </div>

          <div className="cart-actions">

            <div className="qty">
              <button
                type="button"
                onClick={() =>
                  setQuantity((q) => Math.max(1, q - 1))
                }
              >
                −
              </button>

              <span>{quantity}</span>

              <button
                type="button"
                onClick={() =>
                  setQuantity((q) => q + 1)
                }
              >
                +
              </button>
            </div>

            <button
              className="btn"
              onClick={addProduct}
            >
              ADD TO CART
            </button>

          </div>

          <div className="specs">

            <h3>Product Specification</h3>

            <div className="spec-row">
              <span>Colour:  </span>
              <strong>{product.color}</strong>
            </div>

            <div className="spec-row">
              <span>Style:  </span>
              <strong>{product.category}</strong>
            </div>

            <div className="spec-row">
              <span>Occasion:  </span>
              <strong>
                Engagement, Festival, Wedding
              </strong>
            </div>

            <div className="spec-row">
              <span>Work:  </span>
              <strong>
                Embroidered, Sequins
              </strong>
            </div>

          </div>

          <div className="offer">
            <span>Buy 2 &amp; Get</span>
            <b>20% Off</b>
          </div>

          <div className="description">

            <h3>Description</h3>

            <p>
              Traditionally, Gadwal Silk Sarees were
              woven with a cotton body and adorned with
              a silk border and pallu, creating a perfect
              balance of lightweight comfort and rich
              elegance.
            </p>

            <p>
              This unique weaving style, known as the
              Kuttu technique, seamlessly joins the silk
              border and pallu to the cotton body,
              ensuring a flawless drape and intricate
              craftsmanship.
            </p>

            <p>
              Our pure silk Gadwal sarees are crafted
              using age-old traditional weaving
              techniques, resulting in an exquisite,
              luxurious fabric with unmatched artistry.
            </p>

            <p>
              Ideal for weddings, festive occasions, and
              cultural celebrations, these sarees exude
              timeless charm and sophistication.
            </p>

          </div>

          <Link to="/shop" className="continue-shopping">
            ← Continue shopping
          </Link>

        </div>
      </div>

      <SectionTitle text="You May Also Like" />

      <div className="product-strip">
        {related.map((item) => (
          <ProductCard
            key={item.id}
            product={item}
            addToCart={addToCart}
            wishlist={wishlist}
            toggleWishlist={toggleWishlist}
          />
        ))}
      </div>
    </div>
  );
}

export default ProductDetail;