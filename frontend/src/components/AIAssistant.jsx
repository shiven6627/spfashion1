import "./AIAssistant.css";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../utils/api";

const COLORS = ["black", "pink", "green", "blue", "purple", "red", "beige", "orange", "brown", "white", "yellow", "gold", "silver"];

const CATEGORY_ALIASES = [
  { category: "Designer Saree", aliases: ["designer saree", "designer sari"] },
  { category: "Casual Saree", aliases: ["casual saree", "casual sari", "daily wear saree", "everyday saree"] },
  { category: "Designer Lehenga", aliases: ["designer lehenga", "lehenga", "lehnga", "bridal lehenga"] },
  { category: "Designer Kurti", aliases: ["designer kurti", "designer kurta", "kurti", "kurta"] },
  { category: "Salwar Kameez", aliases: ["salwar kameez", "salwar kameez", "salwar suit", "salwar", "kameez", "suit"] },
];

function money(value) { return `₹${Number(value || 0).toLocaleString("en-IN")}`; }
function nameOf(p) { return p?.name || p?.title || "Product"; }
function categoryOf(p) { return p?.category || p?.type || p?.categoryName || ""; }
function normalize(value) { return String(value || "").toLowerCase().replace(/[^a-z0-9₹\s]/g, " ").replace(/\s+/g, " ").trim(); }

function parseMoneyValue(raw, unit = "") {
  let value = Number(String(raw).replace(/,/g, ""));
  if (!Number.isFinite(value)) return null;
  const normalizedUnit = String(unit).toLowerCase();
  if (normalizedUnit === "k" || normalizedUnit === "thousand") value *= 1000;
  if (normalizedUnit === "l" || normalizedUnit === "lakh") value *= 100000;
  return value;
}

function parsePrices(text) {
  const q = normalize(text).replace(/,/g, "");
  const moneyPattern = "(?:₹|rs\\.?|inr)?\\s*(\\d+(?:\\.\\d+)?)\\s*(k|thousand|l|lakh)?";
  const between = q.match(new RegExp(`(?:between|from)\\s*${moneyPattern}\\s*(?:and|to|-|–)\\s*${moneyPattern}`, "i"));
  if (between) {
    const first = parseMoneyValue(between[1], between[2]);
    const second = parseMoneyValue(between[3], between[4]);
    if (first != null && second != null) return { minPrice: Math.min(first, second), maxPrice: Math.max(first, second) };
  }
  const maximum = q.match(new RegExp(`(?:under|below|less than|upto|up to|max(?:imum)?|within|budget(?: of)?|under a budget of)\\s*${moneyPattern}`, "i"));
  if (maximum) return { minPrice: null, maxPrice: parseMoneyValue(maximum[1], maximum[2]) };
  const exact = q.match(new RegExp(`(?:₹|rs\\.?|inr)\\s*(\\d+(?:\\.\\d+)?)\\s*(k|thousand|l|lakh)?`, "i"));
  if (exact) return { minPrice: null, maxPrice: parseMoneyValue(exact[1], exact[2]) };
  const bare = q.match(/(?:^|\s)(\d+(?:\.\d+)?)\s*(k|thousand|l|lakh)(?:\s|$)/i);
  if (bare) return { minPrice: null, maxPrice: parseMoneyValue(bare[1], bare[2]) };
  return { minPrice: null, maxPrice: null };
}

function parseColor(text) {
  const q = normalize(text);
  return COLORS.find(color => q.includes(`${color} color`) || q.includes(`${color} colour`) || new RegExp(`\\b${color}\\b`, "i").test(q)) || null;
}

function parseCategory(text, products) {
  const q = normalize(text);
  const knownCategories = [...new Set((products || []).map(categoryOf).filter(Boolean))];
  for (const entry of CATEGORY_ALIASES) {
    if (entry.aliases.some(alias => q.includes(normalize(alias)))) {
      return knownCategories.find(category => normalize(category) === normalize(entry.category)) || entry.category;
    }
  }
  return knownCategories.find(category => q.includes(normalize(category))) || null;
}

function parseProductFamily(text) {
  const q = normalize(text);
  if (/\b(saree|sari)\b/.test(q)) return "saree";
  if (/\b(lehenga|lehnga)\b/.test(q)) return "lehenga";
  if (/\b(kurti|kurta)\b/.test(q)) return "kurti";
  if (/\b(salwar|kameez|salwar suit)\b/.test(q)) return "salwar";
  return "";
}

function productMatchesFilter(product, { category, color, minPrice, maxPrice, search }) {
  if (category && !normalize(categoryOf(product)).includes(normalize(category))) return false;
  if (color && normalize(product.color || "") !== normalize(color)) return false;
  if (minPrice != null && Number(product.price) < minPrice) return false;
  if (maxPrice != null && Number(product.price) > maxPrice) return false;
  if (search && !normalize(`${nameOf(product)} ${categoryOf(product)} ${product.description || ""}`).includes(normalize(search))) return false;
  return true;
}


export default function AIAssistant({ user, cart, wishlist, products, addToCart, removeFromCart, changeQty }) {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [question, setQuestion] = useState("");
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState([{ type: "bot", text: "Hi! I’m your SP FASHION shopping assistant. Ask me to find products by category, colour or price, manage your cart, or tell you about your recent orders." }]);

  const cartTotal = (cart || []).reduce((sum, item) => sum + Number(item.price || 0) * Number(item.quantity || 1), 0);
  const cartText = () => !user ? "Please log in to view your personal cart." : !cart.length ? "Your cart is empty." : `You have ${cart.reduce((s, i) => s + Number(i.quantity || 1), 0)} item(s) in your cart: ${cart.map(i => `${nameOf(i)} × ${i.quantity}`).join(", ")}. Subtotal: ${money(cartTotal)}.`;

  async function recentOrders() {
    if (!user) return { text: "Please log in first so I can access your personal orders." };
    const { data } = await api.get("/orders/my?limit=10");
    const orders = data.orders || [];
    if (!orders.length) return { text: "You do not have any orders yet." };
    const lines = orders.slice(0, 5).map((o, index) => `${index + 1}. ${o.orderNumber} — ${o.status.toUpperCase()} — ${money(o.total)} — ${new Date(o.createdAt).toLocaleDateString("en-IN")} — ${o.items.map(i => `${i.name} × ${i.quantity}`).join(", ")}`);
    return { text: `Here are your latest orders:\n${lines.join("\n")}\n\nYou can open My Orders from your Account page to see the full tracking timeline.` };
  }

  function shopFilter(text) {
    const { minPrice, maxPrice } = parsePrices(text);
    const color = parseColor(text);
    const category = parseCategory(text, products);
    const productFamily = parseProductFamily(text);
    const q = normalize(text);
    const shoppingIntent = /\b(show|find|search|looking for|want|give me|browse|see|shop|buy|need)\b/.test(q);
    const hasFilter = minPrice != null || maxPrice != null || color || category;
    if (!shoppingIntent && !hasFilter) return null;

    const ignoredWords = new Set([
      "show", "me", "find", "search", "for", "looking", "want", "give", "i", "the", "a", "an", "products", "product",
      "below", "under", "less", "than", "color", "colour", "red", "pink", "green", "blue", "black", "purple", "beige", "orange", "brown", "white", "yellow", "gold", "silver",
      "saree", "sari", "designer", "casual", "daily", "wear", "lehenga", "lehnga", "bridal", "kurti", "kurta", "salwar", "kameez", "suit",
      "up", "to", "max", "maximum", "within", "budget", "between", "from", "and", "or", "in", "₹", "rs", "inr", "k", "thousand", "l", "lakh", "shop", "buy", "need", "want"
    ]);
    const searchWords = q.split(" ").filter(w => !/^\d/.test(w) && !ignoredWords.has(w));
    const params = new URLSearchParams();
    if (category) params.set("category", category);
    if (color) params.set("color", color);
    if (minPrice != null) params.set("minPrice", String(minPrice));
    if (maxPrice != null) params.set("maxPrice", String(maxPrice));
    const searchTerm = category ? "" : [productFamily, ...searchWords].filter(Boolean).join(" ");
    if (searchTerm) params.set("search", searchTerm);

    const count = (products || []).filter(p => productMatchesFilter(p, { category, color, minPrice, maxPrice, search: searchTerm })).length;
    navigate(`/shop?${params.toString()}`);
    const priceText = minPrice != null && maxPrice != null
      ? `${money(minPrice)}–${money(maxPrice)}`
      : maxPrice != null
        ? `up to ${money(maxPrice)}`
        : minPrice != null
          ? `from ${money(minPrice)}`
          : null;
    const filterText = [category, color && `${color} colour`, priceText].filter(Boolean).join(" · ");
    return `I’ve opened Shop with ${filterText || "your requested products"} applied. ${count} matching product(s) are available.`;
  }

  async function answer(text) {
    const q = normalize(text);
    if (!q) return "Please type a question.";
    if (/\b(hello|hi|hey|good morning|good evening)\b/.test(q)) return "Hello! What would you like to shop for today?";

    if (/\b(recent orders|my orders|order history|previous orders|latest orders|where is my order|track my order|order status|track order)\b/.test(q)) {
      try { return (await recentOrders()).text; }
      catch (e) { return e.response?.data?.message || "I couldn’t load your orders right now. Please open My Orders from Account."; }
    }

    const filtered = shopFilter(text);
    if (filtered) return filtered;

    if (q.includes("cart total") || q.includes("total in cart")) return user ? `Your cart subtotal is ${money(cartTotal)}.` : "Please log in to view your cart total.";
    if (q.includes("my cart") || q.includes("cart items") || q === "cart") return cartText();

    if ((q.includes("add") && (q.includes("cart") || q.includes("bag"))) && products?.length) {
      const product = products.find(p => q.includes(normalize(nameOf(p))));
      if (!product) return "Tell me the product name you want to add, for example: Add Banarasi Saree to cart.";
      addToCart(product); return `${nameOf(product)} has been added to your cart.`;
    }
    if ((q.includes("remove") || q.includes("delete")) && q.includes("cart")) {
      const item = (cart || []).find(i => q.includes(normalize(nameOf(i))));
      if (!item) return "Please mention the cart product name you want to remove.";
      removeFromCart(item.id); return `${nameOf(item)} has been removed from your cart.`;
    }
    if (q.includes("increase") || q.includes("add one more")) {
      const item = (cart || []).find(i => q.includes(normalize(nameOf(i))));
      if (!item) return "Please mention the product name whose quantity you want to increase.";
      changeQty(item.id, 1); return `${nameOf(item)} quantity increased.`;
    }
    if (q.includes("decrease") || q.includes("one less") || q.includes("reduce quantity")) {
      const item = (cart || []).find(i => q.includes(normalize(nameOf(i))));
      if (!item) return "Please mention the product name whose quantity you want to decrease.";
      changeQty(item.id, -1); return `${nameOf(item)} quantity decreased.`;
    }
    if (q.includes("wishlist") || q.includes("favorite")) return !user ? "Please log in to view your personal wishlist." : `You have ${wishlist?.length || 0} saved product(s) in your wishlist.`;
    if (q.includes("checkout") || q.includes("place order")) { if (!user) return "Please log in before checkout."; if (!cart.length) return "Your cart is empty."; navigate("/checkout"); return "I’ve opened checkout for you."; }
    if (q.includes("payment")) return "SP FASHION currently supports Cash on Delivery. The payment method is shown at checkout.";
    if (q.includes("delivery") || q.includes("shipping")) return "Shipping is free for orders of ₹5,000 or more; otherwise the current shipping fee is ₹150.";
    if (q.includes("category") || q.includes("collection")) return `Our available collections include ${[...new Set((products || []).map(categoryOf).filter(Boolean))].join(", ") || "fashion products"}.`;
    if (q.includes("contact") || q.includes("support")) return "Please use the Contact page for SP FASHION customer support.";
    if (q.includes("who are you") || q.includes("what can you do")) return "I can search the entire catalogue using natural language, filter by product/category/colour/price, manage your cart, and explain your recent orders and tracking status.";
    return "Try: “Show designer sarees below ₹20,000”, “Show red designer lehengas under 20k”, “Show casual sarees between ₹3k and ₹8k”, or “Tell me my recent orders”.";
  }

  async function sendMessage(e) {
    e.preventDefault();
    const text = question.trim();
    if (!text || loading) return;
    setQuestion(""); setLoading(true);
    setMessages(old => [...old, { type: "user", text }, { type: "bot", text: "Thinking…", pending: true }]);
    try {
      const result = await answer(text);
      setMessages(old => [...old.filter(m => !m.pending), { type: "bot", text: result }]);
    } catch { setMessages(old => [...old.filter(m => !m.pending), { type: "bot", text: "Something went wrong. Please try again." }]); }
    finally { setLoading(false); }
  }

  return <div className="ai-assistant">
    {open && <div className="ai-chat">
      <div className="ai-header"><div className="ai-brand"><div className="ai-logo">✦</div><div><strong>SP FASHION</strong><small>Personal Shopping Assistant</small></div></div><button type="button" onClick={() => setOpen(false)} className="ai-close">×</button></div>
      <div className="ai-status"><span></span> Online · Ready to help</div>
      <div className="ai-messages">{messages.map((m, i) => <div key={i} className={`ai-message ${m.type === "user" ? "user-message" : "bot-message"}`}>{m.text}</div>)}</div>
      <div className="ai-suggestions">
        <button type="button" onClick={() => setQuestion("Show designer sarees below ₹20000")}>Sarees under ₹20K</button>
        <button type="button" onClick={() => setQuestion("Show red colour products")}>Red products</button>
        <button type="button" onClick={() => setQuestion("Show my recent orders")}>My Orders</button>
      </div>
      <form className="ai-input" onSubmit={sendMessage}><input value={question} onChange={e => setQuestion(e.target.value)} placeholder="Ask about products or orders..." aria-label="Ask SP Fashion Assistant" /><button type="submit" disabled={loading}>➤</button></form>
    </div>}
    <button type="button" className="ai-button" onClick={() => setOpen(!open)} aria-label="Open SP Fashion Assistant"><span>✦</span></button>
  </div>;
}
