import "./Header.css";
import { useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import logo from "../assets/header.jpg";

function Header({ cartCount = 0, wishlistCount = 0 }) {
  const [search, setSearch] = useState("");
  const [menuOpen, setMenuOpen] = useState(false);
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("sp-user") || "null");

  function closeMenu() {
    setMenuOpen(false);
  }

  function submitSearch(e) {
    e.preventDefault();
    const value = search.trim();
    if (value) {
      navigate("/search?q=" + encodeURIComponent(value));
      closeMenu();
    }
  }

  return (
    <header className="header">
      <div className="header-inner">
        <Link to="/" className="logo" onClick={closeMenu} aria-label="SP Fashion home">
          <img src={logo} alt="SP Fashion" />
        </Link>

        <button
          type="button"
          className="menu-toggle"
          aria-label={menuOpen ? "Close navigation menu" : "Open navigation menu"}
          aria-expanded={menuOpen}
          aria-controls="primary-navigation"
          onClick={() => setMenuOpen((open) => !open)}
        >
          <span />
          <span />
          <span />
        </button>

        <nav id="primary-navigation" className={`main-nav${menuOpen ? " is-open" : ""}`} aria-label="Main navigation">
          <NavLink to="/" onClick={closeMenu}>Home</NavLink>
          <NavLink to="/shop" onClick={closeMenu}>Shop</NavLink>
          <NavLink to="/wishlist" onClick={closeMenu}>
            Wishlist{wishlistCount > 0 ? ` (${wishlistCount})` : ""}
          </NavLink>
          <NavLink to="/cart" onClick={closeMenu}>
            Cart{cartCount > 0 ? ` (${cartCount})` : ""}
          </NavLink>
          {user?.role === "admin" && <NavLink to="/admin" onClick={closeMenu}>Admin</NavLink>}
          <NavLink to="/account" className="mobile-account-link" onClick={closeMenu}>Account</NavLink>
        </nav>

        <form className="search-box" onSubmit={submitSearch} role="search">
          <span className="search-icon" aria-hidden="true">⌕</span>
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search products"
            aria-label="Search products"
          />
        </form>

        <Link to="/account" className="account desktop-account">
          <span className="account-icon" aria-hidden="true">♟</span>
          <span>Account</span>
        </Link>
      </div>
    </header>
  );
}

export default Header;
