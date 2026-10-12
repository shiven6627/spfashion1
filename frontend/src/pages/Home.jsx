import "./Home.css";
import { Link } from "react-router-dom";
import SectionTitle from "../components/SectionTitle";
import ProductCard from "../components/ProductCard";
import { products, categories } from "../data/products";
import herosection from "../assets/herosection.jpg";
import homeBanner from "../assets/homebanner.jpg";
import newArrival from "../assets/home-new-arrival.jpg";
import heritageBanner from "../assets/heritage-banner.jpg";
import Testimonials from "../components/Testimonials";
import AboutFashion from "../components/AboutFashion";

function Home({ addToCart, wishlist, toggleWishlist, products: catalogProducts }) {
  const featured = (catalogProducts || products).slice(0, 8);

  return (
    <div>
     <section 
  className="hero"
  style={{ backgroundImage: `url(${herosection})` }}
>
  <div className="hero-left">
    <h1>
      Change Your
      <br />
      Style
      <br />
      With Us
    </h1>

    <p>
      We have a wide range of collections of Wedding Saree,
      Party Wear Kurti, Salwar Kameez, Designer Lehenga choli
      and many more.
    </p>
  </div>

  <div className="hero-right">
    <h2>
      Explore
      <br />
      Unique
      <br />
      Collections
    </h2>

    <Link className="hero-button" to="/shop">
      SHOP NOW
    </Link>
  </div>
</section>

  <SectionTitle text="Explore Categories" />

<div   className="category-row">
  {categories.map((category, index) => (
    <Link
      className={`category-card category-${index + 1}`}
      key={category.name}
      to={"/category/" + encodeURIComponent(category.name)}
    >
      <img src={category.image} alt={category.name} />
      <strong>{category.name}</strong>
    </Link>
  ))}
</div>
     
      <h2 className="trusted-title">
  Trusted By 5,000+ Customers
</h2>

<section
  className="sale-banner"
  style={{ backgroundImage: `url(${homeBanner})` }}
>
  <div className="sale-copy">
    <div className="sale-script">NewYear</div>

    <h2>
      Sale is <span>LIVE</span>
    </h2>

    <h3>Buy 2 &amp; Get 20% OFF</h3>

    <Link className="sale-button" to="/shop">
      START SHOPPING NOW
    </Link>

    <div className="sale-bottom">
      Limited period offer
    </div>
  </div>
</section>


<SectionTitle text="New Arrivals" />

<div className="new-arrivals">

  <div className="arrival-large">
    <img src={newArrival} alt="New arrivals" />

    <div className="large-arrival-text">
      Add a touch of
      <br />
      royal elegance
    </div>
  </div>

  <div className="arrival-grid">
    {(catalogProducts || products).slice(60, 64).map((product, index) => {
      const arrivalText = [
        "Unique designer saree",
        "Designer Salvar Kameez",
        "Unique designer Kurti",
        "Glamour casual saree"
      ];

      return (
        <Link
          to={"/product/" + product.id}
          className="arrival-card"
          key={product.id}
        >
          <img
            src={product.image}
            alt={product.name}
          />

          <div className="arrival-text">
            {arrivalText[index]}
          </div>

          <span className="arrival-button">
            SHOP NOW
          </span>
        </Link>
      );
    })}
  </div>

</div>

<section className="heritage-banner">
  <img
    src={heritageBanner}
    alt="Bold patterns and rich textures. Classic blend of heritage."
  />
</section>
      <SectionTitle text="Popular Products" />
      <div  className="product-strip">
        {featured.slice(4, 8).map((product) => (
          <ProductCard key={product.id} product={product} addToCart={addToCart} wishlist={wishlist} toggleWishlist={toggleWishlist} />
        ))}
      </div>
      <Testimonials />
      <AboutFashion />

      <div className="intro-copy">
        <h2>Style That Feels Special</h2>
        <p>Explore sarees, lehengas, salwar kameez and designer kurtis selected for modern Indian wardrobes.</p>
      </div>
    </div>
  );
}

export default Home;
