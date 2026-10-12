import "./Checkout.css";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import EmptyState from "../components/EmptyState";
import api from "../utils/api";
import { sendOrderConfirmationEmail } from "../utils/emailjs";

function Checkout({ cart, setCart, user }) {
  const navigate = useNavigate();

  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");
  const [orderNumber, setOrderNumber] = useState("");
  const [billingAddress, setBillingAddress] = useState("same");
  const [discount, setDiscount] = useState("");
  const [emailStatus, setEmailStatus] = useState("");

  const [form, setForm] = useState({
    name: user?.name || "",
    email: user?.email || "",
    phone: "",
    address: "",
    apartment: "",
    city: "",
    state: "",
    pincode: "",
    upi: "",
    card: "",
  });

  if (!user) {
    return (
      <div className="page-shell account-page">
        <div className="account-box">
          <h1>Login required to purchase</h1>
          <p className="account-welcome">
            Please log in to your SP Fashion account or create an account before placing an order.
            Your shopping bag will be saved while you sign in.
          </p>
          <div className="account-actions">
            <button className="btn" type="button" onClick={() => navigate("/account", { state: { from: "/checkout", mode: "login" } })}>
              LOGIN TO CONTINUE
            </button>
            <button className="outline" type="button" onClick={() => navigate("/account", { state: { from: "/checkout", mode: "signup" } })}>
              CREATE ACCOUNT
            </button>
            <button className="outline" type="button" onClick={() => navigate("/cart")}>
              RETURN TO CART
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (cart.length === 0 && !submitted) {
    return (
      <div className="page-shell">
        <EmptyState
          title="Nothing to checkout"
          text="Your shopping bag is empty."
          link="/shop"
        />
      </div>
    );
  }

  if (submitted) {
    return (
      <div className="page-shell">
        <EmptyState
          title="Order placed successfully!"
          text={`Thank you for shopping with SP Fashion. Your order has been recorded. Order reference: ${orderNumber || "confirmed"}. ${emailStatus}`}
          link="/"
          label="Back to Home"
        />
      </div>
    );
  }

  const subtotal = cart.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  const shippingFee = subtotal >= 5000 ? 0 : 150;
  const total = subtotal + shippingFee;

  function update(e) {
    const { name, value } = e.target;

    setForm({
      ...form,
      [name]: value,
    });
  }

  async function submit(e) {
    e.preventDefault();
    setError("");
    try {
      const { data } = await api.post("/orders", {
        customer: { name: `${form.name} ${form.lastName || ""}`.trim(), email: form.email, phone: form.phone },
        shippingAddress: { address: form.address, apartment: form.apartment, city: form.city, state: form.state, pincode: form.pincode, country: "India" },
        items: cart.map((item) => ({ productId: item.id, name: item.name, image: item.image, price: Number(item.price), quantity: Number(item.quantity), category: item.category || "" })),
        paymentMethod: "cod",
      });
      setOrderNumber(data.order?.orderNumber || data.order?._id || "");
      try {
        await sendOrderConfirmationEmail(data.order, form, cart);
        setEmailStatus("A confirmation email has been sent to your email address.");
      } catch (emailError) {
        console.warn("EmailJS order confirmation failed:", emailError);
        setEmailStatus("Your order was placed successfully, but the confirmation email could not be sent. You can still track the order from your account.");
      }
      setCart([]);
      setSubmitted(true);
    } catch (err) {
      setError(err.response?.data?.message || "We could not place your order. Please check the backend and try again.");
    }
  }

  return (
    <div className="checkout-page">
      <form className="checkout-layout" onSubmit={submit}>
        <div className="checkout-left">
          <section className="checkout-contact">
            <div className="checkout-title-row">
              <h2>Contact</h2>
              <p>Signed in as {user.email}</p>
            </div>

            <input
              className="checkout-input"
              type="email"
              name="email"
              value={form.email}
              onChange={update}
              placeholder="Email address"
              required
            />
          </section>

          <section className="checkout-section">
            <h2>Delivery</h2>

            <div className="country-box">
              <span>Country/Region</span>
              <strong>India</strong>
            </div>

            <div className="two-inputs">
              <input
                className="checkout-input"
                name="name"
                value={form.name}
                onChange={update}
                placeholder="First Name"
                required
              />

              <input
                className="checkout-input"
                name="lastName"
                placeholder="Last Name"
              />
            </div>

            <input
              className="checkout-input"
              name="address"
              value={form.address}
              onChange={update}
              placeholder="Address"
              required
            />

            <input
              className="checkout-input"
              name="apartment"
              value={form.apartment}
              onChange={update}
              placeholder="Apartment,suite,etc"
            />

            <input
              className="checkout-input"
              name="phone"
              value={form.phone}
              onChange={update}
              placeholder="Phone number for order updates"
              required
            />

            <div className="three-inputs">
              <input
                className="checkout-input"
                name="city"
                value={form.city}
                onChange={update}
                placeholder="City"
                required
              />

              <input
                className="checkout-input"
                name="state"
                value={form.state}
                onChange={update}
                placeholder="State"
                required
              />

              <input
                className="checkout-input"
                name="pincode"
                value={form.pincode}
                onChange={update}
                placeholder="Pincode"
                required
              />
            </div>

            <label className="saved-info">
              <input type="checkbox" />
              <span>Saved Information For Next time</span>
            </label>
          </section>

          <section className="checkout-section">
            <h2>Shipping Method</h2>

            <div className="shipping-box">
              Enter your shipping address to view available Shipping methods
            </div>
          </section>

          <section className="checkout-section payment-section">
            <h2>Payment</h2>
            <div className="payment-box active">
              <strong>Cash on Delivery</strong>
              <p className="payment-note">Pay when your order arrives. Online payment will be available after a secure payment gateway is configured.</p>
            </div>
          </section>

          <section className="checkout-section billing-section">
            <h2>Billing Address</h2>

            <label
              className={
                billingAddress === "same"
                  ? "billing-option active"
                  : "billing-option"
              }
            >
              <input
                type="radio"
                name="billing"
                value="same"
                checked={billingAddress === "same"}
                onChange={(e) => setBillingAddress(e.target.value)}
              />

              <span>Same as Shipping address</span>
            </label>

            <label
              className={
                billingAddress === "different"
                  ? "billing-option active"
                  : "billing-option"
              }
            >
              <input
                type="radio"
                name="billing"
                value="different"
                checked={billingAddress === "different"}
                onChange={(e) => setBillingAddress(e.target.value)}
              />

              <span>Use a different billing address</span>
            </label>
          </section>

          {error && <p role="alert" className="checkout-error">{error}</p>}
          <button className="pay-button" type="submit">
            PLACE ORDER · CASH ON DELIVERY
          </button>
        </div>

        <aside className="checkout-right">
          <div className="order-product">
            {cart.map((item) => (
              <div className="order-product-item" key={item.id}>
                <div className="product-image-box">
                  <img src={item.image} alt={item.name} />

                  <span className="product-quantity">
                    {item.quantity}
                  </span>
                </div>

                <div className="order-product-name">
                  <h3>{item.name}</h3>
                </div>

                <div className="order-product-price">
                  Rs. {item.price.toLocaleString("en-IN")}
                </div>
              </div>
            ))}
          </div>

          <div className="discount-row">
            <input
              className="discount-input"
              value={discount}
              onChange={(e) => setDiscount(e.target.value)}
              placeholder="Discount or gift card apply here"
            />

            <button
              className="apply-button"
              type="button"
              onClick={() => {
                if (!discount.trim()) {
                  alert("Please enter a discount or gift card.");
                  return;
                }

                alert("Discount code applied.");
              }}
            >
              APPLY
            </button>
          </div>

          <div className="price-summary">
            <div className="price-row">
              <span>Subtotal</span>

              <strong>
                Rs. {subtotal.toLocaleString("en-IN")}
              </strong>
            </div>

            <div className="price-row">
              <span>Shipping</span>
              <strong>{shippingFee === 0 ? "FREE" : `Rs. ${shippingFee.toLocaleString("en-IN")}`}</strong>
            </div>
            <div className="price-row total-row">
              <span>Total</span>

              <strong>
                Rs. {total.toLocaleString("en-IN")}
              </strong>
            </div>
          </div>
        </aside>
      </form>
    </div>
  );
}

export default Checkout;