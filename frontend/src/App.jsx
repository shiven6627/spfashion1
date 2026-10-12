import { useEffect, useState } from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom";

import Header from "./components/Header";
import Footer from "./components/Footer";
import Home from "./pages/Home";
import Shop from "./pages/Shop";
import ProductDetail from "./pages/ProductDetail";
import Wishlist from "./pages/Wishlist";
import Cart from "./pages/Cart";
import Checkout from "./pages/Checkout";
import SearchPage from "./pages/SearchPage";
import InfoPage from "./pages/InfoPage";
import Blog from "./pages/Blog";
import Contact from "./pages/Contact";
import Account from "./pages/Account";
import NotFound from "./pages/NotFound";
import AIAssistant from "./components/AIAssistant";
import ScrollToTop from "./components/ScrollToTop";
import About from "./pages/About";
import Admin from "./pages/Admin";
import api from "./utils/api";

import { products } from "./data/products";

function readStorage(key) {
  try {
    const saved = localStorage.getItem(key);
    return saved ? JSON.parse(saved) : [];
  } catch {
    return [];
  }
}

function App() {
  const [user, setUser] = useState(() => {
    try {
      const savedUser = localStorage.getItem("sp-user");
      return savedUser ? JSON.parse(savedUser) : null;
    } catch {
      return null;
    }
  });

  const [cart, setCart] = useState(() => readStorage("sp-cart-guest"));

  const [wishlist, setWishlist] = useState(() =>
    readStorage("sp-wishlist")
  );
  const [databaseProducts, setDatabaseProducts] = useState([]);
  useEffect(() => { api.get("/products").then(({data}) => setDatabaseProducts(data.products || [])).catch(() => {}); }, []);
  const productCatalog = [...databaseProducts.map(p => ({...p, id: p._id, image: p.image, color: p.color || "multi"})), ...products];

  useEffect(() => {
    if (user) {
      localStorage.setItem("sp-user", JSON.stringify(user));
    } else {
      localStorage.removeItem("sp-user");
    }
  }, [user]);

  useEffect(() => {
    localStorage.setItem("sp-cart-guest", JSON.stringify(cart));
  }, [cart]);

  useEffect(() => {
    localStorage.setItem(
      "sp-wishlist",
      JSON.stringify(wishlist)
    );
  }, [wishlist]);

  function loginUser(account) {
    const loggedUser = {
      name: account.name,
      email: account.email,
      role: account.role || "customer",
      id: account.id || account._id,
    };
    setUser(loggedUser);
  }

  function logoutUser() {
    setUser(null);
  }

  function addToCart(product) {
    setCart((oldCart) => {
      const found = oldCart.find(
        (item) => item.id === product.id
      );

      if (found) {
        return oldCart.map((item) =>
          item.id === product.id
            ? {
                ...item,
                quantity: item.quantity + 1,
              }
            : item
        );
      }

      return [
        ...oldCart,
        {
          ...product,
          quantity: 1,
        },
      ];
    });
  }

  function changeQty(id, amount) {
    setCart((oldCart) =>
      oldCart.map((item) =>
        item.id === id
          ? {
              ...item,
              quantity: Math.max(
                1,
                item.quantity + amount
              ),
            }
          : item
      )
    );
  }

  function removeFromCart(id) {
    setCart((oldCart) =>
      oldCart.filter((item) => item.id !== id)
    );
  }

  function toggleWishlist(id) {
    setWishlist((oldWishlist) =>
      oldWishlist.includes(id)
        ? oldWishlist.filter(
            (item) => item !== id
          )
        : [...oldWishlist, id]
    );
  }

  const cartCount = cart.reduce(
    (sum, item) => sum + item.quantity,
    0
  );

  return (
    <BrowserRouter>
     <ScrollToTop />
      <Header
        cartCount={cartCount}
        wishlistCount={wishlist.length}
      />

      <main>
        <Routes>
          <Route path="/admin" element={<Admin user={user} />} />

          <Route
            path="/"
            element={
              <Home
                products={productCatalog}
                addToCart={addToCart}
                wishlist={wishlist}
                toggleWishlist={toggleWishlist}
              />
            }
          />

          <Route
            path="/shop"
            element={
              <Shop
                products={productCatalog}
                addToCart={addToCart}
                wishlist={wishlist}
                toggleWishlist={toggleWishlist}
              />
            }
          />

          <Route
            path="/category/:category"
            element={
              <Shop
                products={productCatalog}
                addToCart={addToCart}
                wishlist={wishlist}
                toggleWishlist={toggleWishlist}
              />
            }
          />

          <Route
            path="/product/:id"
            element={
              <ProductDetail
                products={productCatalog}
                addToCart={addToCart}
                wishlist={wishlist}
                toggleWishlist={toggleWishlist}
              />
            }
          />

          <Route
            path="/wishlist"
            element={
              <Wishlist
                products={productCatalog}
                wishlist={wishlist}
                toggleWishlist={toggleWishlist}
                addToCart={addToCart}
              />
            }
          />

          <Route
            path="/cart"
            element={
              <Cart
                cart={cart}
                changeQty={changeQty}
                removeFromCart={removeFromCart}
              />
            }
          />

          <Route
            path="/checkout"
            element={
              <Checkout
                cart={cart}
                setCart={setCart}
                user={user}
              />
            }
          />

          <Route
            path="/search"
            element={
              <SearchPage
                products={productCatalog}
                addToCart={addToCart}
                wishlist={wishlist}
                toggleWishlist={toggleWishlist}
              />
            }
          />

        <Route
       path="/about"
       element={<About />}
          />

          <Route
            path="/blog"
            element={<Blog />}
          />

         <Route
      path="/privacy"
        element={
    <InfoPage title="Privacy Policy">

      <p>
        At <strong>SP Fashion</strong>, we are committed to
        respecting and protecting your privacy. Any personal
        information you provide, such as your postal address,
        email, phone number, and payment details, is collected
        solely to facilitate seamless communication with you
        before, during, and after your purchase. We do not
        share, sell, or disclose your personal information to
        third parties without your consent.
      </p>

      <p>
        We follow strict privacy practices to ensure
        transparency, accountability, and the protection of
        personal data. The information collected is used only
        to process orders and communicate offers, ensuring a
        secure and hassle-free shopping experience.
      </p>

      <h3>Personal Information We Collect</h3>

      <p>
        We collect essential details such as your name,
        address, and email ID for order processing and
        customer service purposes. Your email is primarily
        used for order updates and inquiries, while your
        address and contact details help facilitate
        deliveries. We do not use this information for any
        other purposes.
      </p>

      <h3>Communication &amp; Announcements</h3>

      <p>
        Occasionally, we may introduce new features, updates,
        or important announcements regarding our services.
        In such cases, we may use your email address to keep
        you informed.
      </p>

      <h3>Cookies &amp; Tracking</h3>

      <p>
        To enhance your shopping experience, we use cookies,
        which are small text files stored on your device, to
        track your shopping session and personalize your
        interactions with our website. These cookies do not
        contain personal data and are completely safe for
        your system.
      </p>

      <h3>Third-Party Services</h3>

      <p>
        To fulfill orders and process payments securely, we
        collaborate with third-party service providers,
        including:
      </p>

      <ul>
        <li>Courier and shipping companies for order delivery.</li>
        <li>Secure payment gateways for billing transactions.</li>
        <li>Live chat services to assist customers.</li>
      </ul>

      <p>
        Only necessary and limited information is shared with
        these third parties to ensure smooth service delivery.
      </p>

      <p>
        We reserve the right to disclose personal information
        if required by legal authorities to comply with
        judicial proceedings.
      </p>

      <p>
        In the event of a merger, acquisition, or asset sale,
        customer information may be transferred to the new
        entity. However, we will notify customers in advance
        via email regarding any changes to the handling of
        personal data.
      </p>

      <h3>Policy Updates</h3>

      <p>
        We may update our Privacy Policy from time to time
        based on changes in our information practices. Any
        modifications will be notified via email or displayed
        as an update on our website. We encourage customers
        to review this page periodically to stay informed
        about any updates.
      </p>

      <p>
        For any concerns or questions regarding this policy,
        feel free to contact us at{" "}
        <strong>customersupport@spfashion.com</strong>.
      </p>

    </InfoPage>
  }
/>
        <Route
  path="/terms"
  element={
    <InfoPage title="Terms & Conditions">

      <p>
        Welcome to www.spfashion.com (the "Website").
      </p>

      <p>
        These Terms and Conditions ("Terms") govern your use
        of the Website. By accessing or using the Website,
        you agree to be bound by these Terms. If you do not
        agree with any part of these Terms, you must not use
        the Website.
      </p>

      <p>
        We follow strict privacy practices to ensure
        transparency, accountability, and the protection of
        personal data. The information collected is used only
        to process orders and communicate offers, ensuring a
        secure and hassle-free shopping experience.
      </p>

      <h3>1. Acceptance of Terms</h3>

      <p>
        By using the Website, you confirm that you are at
        least the age of majority in your jurisdiction and
        have the legal capacity to enter into these Terms.
        If you are using the Website on behalf of an
        organisation, you represent that you have the
        authority to bind that organisation to these Terms.
      </p>

      <h3>2. Changes to Terms</h3>

      <p>
        We reserve the right to modify or update these Terms
        at any time without prior notice. Your continued use
        of the Website after any changes constitutes your
        acceptance of the revised Terms. It is your
        responsibility to review these Terms periodically.
      </p>

      <h3>3. Use of the Website</h3>

      <p>
        You agree to use the Website only for lawful purposes
        and in a manner that does not infringe the rights of
        others or restrict or inhibit their use of the Website.
        Prohibited activities include, but are not limited to:
      </p>

      <ul>
        <li>Violating any applicable laws or regulations.</li>
        <li>
          Uploading or transmitting malicious code, viruses,
          or harmful content.
        </li>
        <li>
          Attempting to gain unauthorised access to the
          Website or its systems.
        </li>
        <li>
          Engaging in any activity that disrupts or interferes
          with the Website's functionality.
        </li>
      </ul>

      <h3>4. Intellectual Property</h3>

      <p>
        All content on the Website, including but not limited
        to text, graphics, logos, images, and software, is the
        property of adi akshoy and co (A unit of akshoy
        creation) or its licensors and is protected by
        intellectual property laws. You may not reproduce,
        distribute, modify, or create derivative works of any
        content without prior written consent from us.
      </p>

      <h3>5. User Accounts</h3>

      <p>
        If the Website requires you to create an account, you
        are responsible for maintaining the confidentiality
        of your account credentials and for all activities
        that occur under your account. You agree to notify us
        immediately of any unauthorised use of your account.
      </p>

      <h3>6. Privacy</h3>

      <p>
        Your use of the Website is subject to our Privacy
        Policy, which explains how we collect, use, and
        protect your personal information. By using the
        Website, you agree to the terms of the Privacy Policy.
      </p>

      <h3>7. Third-Party Links</h3>

      <p>
        The Website may contain links to third-party websites
        or services that are not owned or controlled by us. We
        are not responsible for the content, privacy policies,
        or practices of any third-party websites. Your use of
        third-party websites is at your own risk.
      </p>

      <h3>8. Disclaimer of Warranties</h3>

      <p>
        The Website is provided "as is" and "as available"
        without any warranties of any kind, either express or
        implied. We do not guarantee that the Website will be
        error-free, secure, or uninterrupted. Your use of the
        Website is at your sole risk.
      </p>

      <h3>9. Contact Information</h3>

      <p>
        If you have any questions about these Terms, please
        contact us at:
      </p>

      <p>
        <strong>customersupport@spfashion.com</strong>
      </p>

    </InfoPage>
  }
/>
          <Route
            path="/contact"
            element={<Contact />}
          />

          <Route
            path="/account"
            element={
              <Account
                user={user}
                setUser={setUser}
                loginUser={loginUser}
                logoutUser={logoutUser}
              />
            }
          />

          <Route
            path="*"
            element={<NotFound />}
          />

        </Routes>
      </main>

      <Footer />

<AIAssistant
  user={user}
  cart={cart}
  wishlist={wishlist}
  products={productCatalog}
  addToCart={addToCart}
  removeFromCart={removeFromCart}
  changeQty={changeQty}
   />   
 </BrowserRouter>
  );
}

export default App;