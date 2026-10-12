import { useEffect, useMemo, useState } from "react";
import { Navigate } from "react-router-dom";
import api from "../utils/api";
import "./Admin.css";

const STATUS_OPTIONS = ["placed", "processing", "shipped", "delivered", "cancelled"];
const emptyForm = { name: "", category: "Designer Saree", price: "", costPrice: "", color: "pink", description: "", stock: "10", image: "" };

function money(value) { return `₹${Number(value || 0).toLocaleString("en-IN")}`; }
function isoDate(d) { return d.toISOString().slice(0, 10); }

export default function Admin({ user }) {
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [mode, setMode] = useState("upload");
  const [prompt, setPrompt] = useState("");
  const [preview, setPreview] = useState("");
  const [form, setForm] = useState(emptyForm);
  const [file, setFile] = useState(null);
  const [group, setGroup] = useState("day");
  const [range, setRange] = useState("month");
  const [from, setFrom] = useState(() => { const d = new Date(); d.setDate(1); return isoDate(d); });
  const [to, setTo] = useState(() => isoDate(new Date()));

  async function loadBase() {
    try { const [p, o] = await Promise.all([api.get("/products/admin/all"), api.get("/orders/admin/all")]); setProducts(p.data.products || []); setOrders(o.data.orders || []); }
    catch (e) { setMessage(e.response?.data?.message || "Could not load admin data."); }
  }

  async function loadAnalytics() {
    try { const { data } = await api.get("/orders/admin/analytics", { params: { from, to, group } }); setAnalytics(data); }
    catch (e) { setMessage(e.response?.data?.message || "Could not calculate analytics."); }
  }

  useEffect(() => { if (user?.role === "admin") loadBase(); }, [user]);
  useEffect(() => { if (user?.role === "admin") loadAnalytics(); }, [user, from, to, group]);

  if (!user) return <Navigate to="/account" replace />;
  if (user.role !== "admin") return <div className="admin-wrap"><h2>Access denied</h2><p>This area is for administrators only.</p></div>;

  function setPreset(value) {
    const now = new Date();
    if (value === "day") { setFrom(isoDate(now)); setTo(isoDate(now)); setGroup("day"); }
    if (value === "month") { const d = new Date(now.getFullYear(), now.getMonth(), 1); setFrom(isoDate(d)); setTo(isoDate(now)); setGroup("day"); }
    if (value === "year") { const d = new Date(now.getFullYear(), 0, 1); setFrom(isoDate(d)); setTo(isoDate(now)); setGroup("month"); }
    if (value === "all") { setFrom(""); setTo(""); setGroup("month"); }
    setRange(value);
  }

  function change(e) { setForm({ ...form, [e.target.name]: e.target.value }); }

  async function generate() {
    setBusy(true); setMessage("");
    try { const { data } = await api.post("/ai/product-image", { prompt: prompt || `${form.name}, ${form.category}, luxury fashion product photography, clean studio background` }); setPreview(data.imageUrl); setForm(f => ({ ...f, image: data.imageUrl })); setMessage("AI image generated. Review it and save the product."); }
    catch (e) { setMessage(e.response?.data?.message || "AI image generation failed."); }
    finally { setBusy(false); }
  }

  async function save(e) {
    e.preventDefault(); setBusy(true); setMessage("");
    try {
      let image = form.image;
      if (file) { const fd = new FormData(); fd.append("image", file); const up = await api.post("/uploads", fd, { headers: { "Content-Type": "multipart/form-data" } }); image = up.data.imageUrl; }
      if (!image) throw new Error("Choose an image or generate one with AI.");
      if (Number(form.costPrice || 0) > Number(form.price)) throw new Error("Cost price cannot be greater than selling price if you want profit reporting to remain meaningful.");
      await api.post("/products", { ...form, price: Number(form.price), costPrice: Number(form.costPrice || 0), stock: Number(form.stock), image });
      setForm(emptyForm); setFile(null); setPreview(""); setMessage("Product saved successfully."); await loadBase();
    } catch (e) { setMessage(e.response?.data?.message || e.message || "Unable to save product."); }
    finally { setBusy(false); }
  }

  async function remove(id) { if (!confirm("Delete this product?")) return; try { await api.delete(`/products/${id}`); await loadBase(); } catch (e) { setMessage(e.response?.data?.message || "Delete failed."); } }
  async function updateStatus(id, status) { try { await api.patch(`/orders/admin/${id}/status`, { status }); await loadBase(); await loadAnalytics(); } catch (e) { setMessage(e.response?.data?.message || "Could not update order status."); } }

  async function exportExcel() {
    try {
      const response = await api.get("/orders/admin/export", { params: { from, to, group }, responseType: "blob" });
      const blob = new Blob([response.data], { type: "application/vnd.ms-excel" });
      const url = URL.createObjectURL(blob); const a = document.createElement("a"); a.href = url; a.download = `sp-fashion-analytics-${from || "all"}-${to || "time"}.xls`; document.body.appendChild(a); a.click(); a.remove(); URL.revokeObjectURL(url);
    } catch { setMessage("Could not download the Excel report."); }
  }

  const maxRevenue = useMemo(() => Math.max(...(analytics?.series || []).map(x => x.revenue), 1), [analytics]);

  return <div className="admin-wrap">
    <header className="admin-head"><div><p className="admin-eyebrow">SP FASHION / MANAGEMENT</p><h1>Admin analytics dashboard</h1><p>Track customers, purchases, orders, revenue and profit.</p></div><div className="admin-stat"><b>{products.length}</b><span>Products</span></div></header>
    {message && <p className="admin-message">{message}</p>}

    <section className="analytics-panel">
      <div className="analytics-head"><div><h2>Business analytics</h2><p>Filter your business performance by day, month or year.</p></div><button className="export-btn" onClick={exportExcel}>DOWNLOAD EXCEL</button></div>
      <div className="analytics-controls">
        <div className="preset-buttons">{["day", "month", "year", "all"].map(x => <button key={x} className={range === x ? "active" : ""} onClick={() => setPreset(x)}>{x === "day" ? "Today" : x === "month" ? "This Month" : x === "year" ? "This Year" : "All Time"}</button>)}</div>
        <label>From<input type="date" value={from} onChange={e => { setFrom(e.target.value); setRange("custom"); }} /></label>
        <label>To<input type="date" value={to} onChange={e => { setTo(e.target.value); setRange("custom"); }} /></label>
        <label>Group<select value={group} onChange={e => setGroup(e.target.value)}><option value="day">Day wise</option><option value="month">Month wise</option><option value="year">Year wise</option></select></label>
      </div>
      <div className="analytics-cards">
        <div><span>Registered customers</span><strong>{analytics?.summary?.registeredCustomers ?? 0}</strong></div>
        <div><span>Purchasing customers</span><strong>{analytics?.summary?.purchasingCustomers ?? 0}</strong></div>
        <div><span>Total orders</span><strong>{analytics?.summary?.totalOrders ?? 0}</strong></div>
        <div><span>Units sold</span><strong>{analytics?.summary?.unitsSold ?? 0}</strong></div>
        <div><span>Total revenue</span><strong>{money(analytics?.summary?.revenue)}</strong></div>
        <div><span>Total profit</span><strong>{money(analytics?.summary?.profit)}</strong></div>
      </div>
      <div className="analytics-table-wrap"><table className="analytics-table"><thead><tr><th>Period</th><th>Customers</th><th>Orders</th><th>Units</th><th>Revenue</th><th>Profit</th></tr></thead><tbody>{(analytics?.series || []).length ? analytics.series.map(row => <tr key={row.period}><td>{row.period}</td><td>{row.customers}</td><td>{row.orders}</td><td>{row.units}</td><td>{money(row.revenue)}</td><td>{money(row.profit)}</td></tr>) : <tr><td colSpan="6">No order data for this period.</td></tr>}</tbody></table></div>
      <div className="revenue-chart">{(analytics?.series || []).map(row => <div className="chart-row" key={`chart-${row.period}`}><span>{row.period}</span><div><i style={{ width: `${Math.max(2, (row.revenue / maxRevenue) * 100)}%` }}></i></div><strong>{money(row.revenue)}</strong></div>)}</div>
    </section>

    <div className="admin-columns">
      <form className="admin-form" onSubmit={save}><h2>Add a product</h2><label>Product name<input name="name" value={form.name} onChange={change} required /></label><div className="admin-row"><label>Category<select name="category" value={form.category} onChange={change}>{["Designer Saree", "Designer Lehenga", "Casual Saree", "Salwar Kameez", "Designer Kurti", "Accessories", "Other"].map(x => <option key={x}>{x}</option>)}</select></label><label>Colour<input name="color" value={form.color} onChange={change} /></label></div><div className="admin-row"><label>Selling price (₹)<input name="price" type="number" min="1" value={form.price} onChange={change} required /></label><label>Cost price (₹)<input name="costPrice" type="number" min="0" value={form.costPrice} onChange={change} placeholder="Your purchase/manufacturing cost" /></label></div><label>Stock<input name="stock" type="number" min="0" value={form.stock} onChange={change} /></label><label>Description<textarea name="description" value={form.description} onChange={change} rows="3" /></label><div className="image-mode"><button type="button" className={mode === "upload" ? "selected" : ""} onClick={() => setMode("upload")}>Upload from gallery</button><button type="button" className={mode === "ai" ? "selected" : ""} onClick={() => setMode("ai")}>Create with AI ✦</button></div>{mode === "upload" ? <label>Product image<input type="file" accept="image/*" onChange={e => { setFile(e.target.files?.[0] || null); setPreview(""); }} /></label> : <><label>Describe the image<input value={prompt} onChange={e => setPrompt(e.target.value)} placeholder="e.g. emerald silk saree on a cream studio backdrop" /></label><button type="button" disabled={busy} onClick={generate} className="ai-generate">{busy ? "Working…" : "✦ Generate product image"}</button></>}{(preview || form.image) && <img className="admin-preview" src={preview || form.image} alt="Product preview" />}<button className="admin-save" disabled={busy}>{busy ? "Saving…" : "Save product"}</button></form>
      <section className="admin-catalog"><h2>Catalogue</h2>{products.length === 0 ? <p>No database products yet. Add your first product.</p> : products.map(x => <article className="admin-product" key={x._id}><img src={x.image} alt="" /><div><b>{x.name}</b><span>{x.category} · {money(x.price)}</span><small>Cost: {money(x.costPrice)} · Stock: {x.stock}</small></div><button onClick={() => remove(x._id)}>Delete</button></article>)}</section>
    </div>

    <section className="admin-catalog admin-orders"><div className="orders-admin-head"><div><h2>All orders</h2><p>Update status and the customer tracking timeline is updated automatically.</p></div><strong>{orders.length} records</strong></div>{orders.length === 0 ? <p>No orders yet.</p> : orders.map(order => <article className="admin-product" key={order._id}><div><b>{order.orderNumber}</b><span>{order.customer?.name} · {order.customer?.email}</span><small>{order.items?.length || 0} item(s) · {money(order.total)} · {order.paymentMethod?.toUpperCase()}</small></div><select aria-label={`Update status for ${order.orderNumber}`} value={order.status} onChange={e => updateStatus(order._id, e.target.value)}>{STATUS_OPTIONS.map(status => <option key={status}>{status}</option>)}</select></article>)}</section>
  </div>;
}
