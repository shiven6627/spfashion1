import "./Cart.css";
import { Link } from "react-router-dom";
import EmptyState from "../components/EmptyState";

const FREE_SHIPPING_AT = 5000;
const SHIPPING_FEE = 150;

function formatINR(amount) {
  return `₹${amount.toLocaleString("en-IN")}`;
}

function Cart({ cart = [], changeQty, removeFromCart }) {
  const itemCount = cart.reduce((sum, item) => sum + item.quantity, 0);
  const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const shipping = subtotal >= FREE_SHIPPING_AT ? 0 : SHIPPING_FEE;
  const total = subtotal + shipping;
  const remainingForFreeShip = Math.max(0, FREE_SHIPPING_AT - subtotal);

  if (cart.length === 0) {
    return (
      <div className="page-shell">
        <div className="shop-heading">
          <h1>Shopping Bag</h1>
        </div>
        <EmptyState
          title="Your bag is empty"
          text="Add something beautiful to your bag to continue."
          link="/shop"
        />
      </div>
    );
  }

  return (
    <div className="page-shell">
      <div className="shop-heading">
        <h1>Shopping Bag</h1>
      </div>

      <div className="cart-layout">
        <section aria-label="Bag items">
          <p className="cart-count muted">
            {itemCount} {itemCount === 1 ? "item" : "items"}
          </p>

          <div className="cart-head" aria-hidden="true">
            <span>Product</span>
            <span>Price</span>
            <span>Quantity</span>
            <span>Total</span>
            <span />
          </div>

          <ul className="cart-list">
            {cart.map((item) => {
              const lineTotal = item.price * item.quantity;

              return (
                <li className="cart-row" key={item.id}>
                  <Link className="cart-product" to={`/product/${item.id}`}>
                    <img src={item.image} alt="" />
                    <div>
                      <strong className="pname">{item.name}</strong>
                      <div className="muted">{item.category}</div>
                    </div>
                  </Link>

                  <span className="total">{formatINR(item.price)}</span>

                  <div className="qty">
                    <button
                      type="button"
                      aria-label={`Decrease quantity of ${item.name}`}
                      disabled={item.quantity <= 1}
                      onClick={() => changeQty(item.id, -1)}
                    >
                      −
                    </button>
                    <span aria-live="polite">{item.quantity}</span>
                    <button
                      type="button"
                      aria-label={`Increase quantity of ${item.name}`}
                      onClick={() => changeQty(item.id, 1)}
                    >
                      +
                    </button>
                  </div>

                  <strong className="new">{formatINR(lineTotal)}</strong>

                  <button
                    type="button"
                    className="remove"
                    onClick={() => removeFromCart(item.id)}
                  >
                    Remove
                  </button>
                </li>
              );
            })}
          </ul>
        </section>

        <aside className="order-summary">
          <h2>Order Summary</h2>
          <div>
            <span>Subtotal</span>
            <strong>{formatINR(subtotal)}</strong>
          </div>
          <div>
            <span>Shipping</span>
            <strong>{shipping === 0 ? "FREE" : formatINR(SHIPPING_FEE)}</strong>
          </div>
          {shipping > 0 ? (
            <p className="ship-note muted">
              Add {formatINR(remainingForFreeShip)} more for free shipping.
            </p>
          ) : (
            <p className="ship-note free">You have unlocked free shipping.</p>
          )}
          <hr />
          <div className="order-total">
            <span>Total</span>
            <strong>{formatINR(total)}</strong>
          </div>
          <Link className="btn full" to="/checkout">
            Proceed to checkout
          </Link>
          <Link className="outline" to="/shop">
            Continue shopping
          </Link>
        </aside>
      </div>
    </div>
  );
}

export default Cart;
