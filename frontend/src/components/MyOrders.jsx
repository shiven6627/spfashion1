import { useEffect, useState } from "react";
import api from "../utils/api";

const STEPS = ["placed", "processing", "shipped", "delivered"];
const labels = { placed: "Order placed", processing: "Processing", shipped: "Shipped", delivered: "Delivered", cancelled: "Cancelled" };

function money(value) { return `₹${Number(value || 0).toLocaleString("en-IN")}`; }

export default function MyOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [expanded, setExpanded] = useState(null);

  async function load() {
    try { setLoading(true); const { data } = await api.get("/orders/my?limit=50"); setOrders(data.orders || []); setError(""); }
    catch (e) { setError(e.response?.data?.message || "Could not load your orders."); }
    finally { setLoading(false); }
  }
  useEffect(() => { load(); }, []);

  if (loading) return <section className="my-orders"><h2>My Orders</h2><p>Loading your orders…</p></section>;
  if (error) return <section className="my-orders"><h2>My Orders</h2><p className="order-error">{error}</p><button className="outline" onClick={load}>TRY AGAIN</button></section>;
  if (!orders.length) return <section className="my-orders"><div className="orders-heading"><h2>My Orders</h2><button className="outline" onClick={() => window.location.href = "/shop"}>SHOP NOW</button></div><p className="orders-empty">You haven't placed any orders yet.</p></section>;

  return <section className="my-orders">
    <div className="orders-heading"><div><h2>My Orders</h2><p>View your recent purchases, current status and delivery tracking.</p></div><button className="outline" onClick={load}>REFRESH</button></div>
    <div className="orders-list">{orders.map(order => {
      const currentIndex = STEPS.indexOf(order.status);
      const cancelled = order.status === "cancelled";
      return <article className="order-card" key={order._id}>
        <div className="order-card-top"><div><strong>{order.orderNumber}</strong><span>{new Date(order.createdAt).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}</span></div><div className="order-total"><strong>{money(order.total)}</strong><span className={`order-status ${order.status}`}>{labels[order.status] || order.status}</span></div></div>
        <div className="order-items">{order.items.map((item, i) => <div key={`${order._id}-${i}`}><span>{item.name} × {item.quantity}</span><strong>{money(item.price * item.quantity)}</strong></div>)}</div>
        {cancelled ? <div className="tracking-cancelled">This order was cancelled.</div> : <div className="tracking"><div className="tracking-line">{STEPS.map((step, i) => <div className={`tracking-step ${i <= currentIndex ? "done" : ""} ${step === order.status ? "current" : ""}`} key={step}><span className="tracking-dot"></span><small>{labels[step]}</small></div>)}</div></div>}
        <button className="track-toggle" onClick={() => setExpanded(expanded === order._id ? null : order._id)}>{expanded === order._id ? "Hide tracking details" : "View tracking details"}</button>
        {expanded === order._id && <div className="tracking-details">{(order.statusHistory?.length ? order.statusHistory : [{ status: order.status, at: order.updatedAt, note: labels[order.status] }]).map((event, i) => <div className="tracking-event" key={i}><span></span><div><strong>{labels[event.status] || event.status}</strong><small>{new Date(event.at).toLocaleString("en-IN")}</small><p>{event.note || "Status updated"}</p></div></div>)}<div className="delivery-address"><strong>Delivery address</strong><span>{order.shippingAddress?.address}, {order.shippingAddress?.city}, {order.shippingAddress?.state} — {order.shippingAddress?.pincode}</span></div></div>}
      </article>;
    })}</div>
  </section>;
}
