import "./Shop.css";
import { useEffect, useMemo, useState } from "react";
import { useParams, useSearchParams } from "react-router-dom";
import ProductCard from "../components/ProductCard";
import { products } from "../data/products";

function normalize(v) { return String(v || "").toLowerCase().trim(); }

function Shop({ title = "Shop", addToCart, wishlist, toggleWishlist, products: catalogProducts }) {
  const { category } = useParams();
  const [params] = useSearchParams();
  const queryCategory = params.get("category") || "";
  const queryColor = params.get("color") || "all";
  const queryMax = Number(params.get("maxPrice"));
  const queryMin = Number(params.get("minPrice"));
  const querySearch = params.get("search") || "";
  const currentCategory = category ? decodeURIComponent(category) : queryCategory;
  const initialMax = Number.isFinite(queryMax) && queryMax > 0 ? queryMax : 30000;
  const initialMin = Number.isFinite(queryMin) && queryMin >= 0 ? queryMin : 0;
  const [color, setColor] = useState(queryColor || "all");
  const [minPrice, setMinPrice] = useState(Math.min(200000, initialMin));
  const [maxPrice, setMaxPrice] = useState(Math.min(200000, initialMax));
  const [sort, setSort] = useState("default");

  useEffect(() => { setColor(queryColor || "all"); setMinPrice(Math.min(200000, initialMin)); setMaxPrice(Math.min(200000, initialMax)); }, [queryCategory, queryColor, queryMin, queryMax]);

  const filtered = useMemo(() => {
    let list = (catalogProducts || products).filter(p => {
      const cat = normalize(p.category);
      const matchesCategory = !currentCategory || cat.includes(normalize(currentCategory));
      const matchesColor = color === "all" || normalize(p.color) === normalize(color);
      const matchesPrice = Number(p.price) >= minPrice && Number(p.price) <= maxPrice;
      const text = normalize(`${p.name || ""} ${p.category || ""} ${p.description || ""}`);
      const matchesSearch = !querySearch || text.includes(normalize(querySearch));
      return matchesCategory && matchesColor && matchesPrice && matchesSearch;
    });
    if (sort === "low") list = [...list].sort((a, b) => a.price - b.price);
    if (sort === "high") list = [...list].sort((a, b) => b.price - a.price);
    if (sort === "name") list = [...list].sort((a, b) => a.name.localeCompare(b.name));
    return list;
  }, [currentCategory, color, minPrice, maxPrice, sort, catalogProducts, querySearch]);

  function clearFilters() { setColor("all"); setMinPrice(0); setMaxPrice(30000); setSort("default"); }
  const heading = currentCategory || (queryColor !== "all" || queryMin || queryMax || querySearch ? "Shop — AI results" : title);

  return <div className="page-shell">
    <div className="shop-heading"><h1>{heading}</h1></div>
    <div className="shop-layout">
      <aside className="filters">
        <div className="filter-head"><strong>FILTERS</strong><button onClick={clearFilters}>Clear</button></div>
        <h4>COLOUR</h4>
        <div className="swatches">{["all", "black", "pink", "green", "blue", "purple", "red", "beige", "orange", "brown"].map(item => <button key={item} title={item} className={`swatch ${item} ${color === item ? "active" : ""}`} onClick={() => setColor(item)} />)}</div>
        <h4>MINIMUM PRICE</h4>
        <input className="range" type="range" min="0" max={Math.max(0, maxPrice - 500)} step="500" value={minPrice} onChange={e => setMinPrice(Math.min(Number(e.target.value), maxPrice - 500))} />
        <div className="range-values"><span>₹0</span><span>₹{minPrice.toLocaleString("en-IN")}</span></div>
        <h4>MAXIMUM PRICE</h4>
        <input className="range" type="range" min={Math.min(0, minPrice)} max="200000" step="500" value={maxPrice} onChange={e => setMaxPrice(Math.max(Number(e.target.value), minPrice + 500))} />
        <div className="range-values"><span>₹{minPrice.toLocaleString("en-IN")}</span><span>₹{maxPrice.toLocaleString("en-IN")}</span></div>
      </aside>
      <section>
        <div className="listing-top"><span>{filtered.length} products{querySearch ? ` for “${querySearch}”` : ""}</span><select value={sort} onChange={e => setSort(e.target.value)}><option value="default">Sort by</option><option value="low">Price: Low to High</option><option value="high">Price: High to Low</option><option value="name">Name</option></select></div>
        {filtered.length ? <div className="product-grid">{filtered.map(product => <ProductCard key={product.id || product._id} product={product} addToCart={addToCart} wishlist={wishlist} toggleWishlist={toggleWishlist} />)}</div> : <div className="empty">No products match these filters.</div>}
      </section>
    </div>
  </div>;
}
export default Shop;
