import "./About.css";
import { asset } from "../utils/assets";

function About() {
  return (
    <div className="about-page">

      <div className="about-heading">
        {/* <span></span> */}
        <h1>About Us</h1>
        {/* <span></span> */}
      </div>

      <section className="about-row">
        <div className="about-image">
          <img
            src={asset("cat-1.jpg")}
            alt="SP Fashion Saree Collection"
          />
        </div>

        <div className="about-text">
          <p>
            SP Fashion founded by late SP in the 2019s is a
            contemporary lifestyle brand that has been a pioneer in
            blending modern aesthetics with authentic and traditional
            craftsmanship. We have built our brand with love and
            dedication based on principles of premium quality, cultural
            heritage and sustainable fashion. Our brand has stood the
            test of time for years and is loved for its curated
            collection of thoughtfully designed Sarees and Punjabi attire
            that celebrates the artistic legacy of our country.
          </p>

          <p>
            We have a wide range of exclusive collection suitable for
            both special occasions and everyday wear, including
            variations like Banarasi, Katan, Tissue Silk, Kora Silk,
            Kanjivaram, Tissue Kanjivaram, Gadwal, Baluchari, Kantha,
            Paithani, Tussar, Dhakai Jamdani, Bengal Handloom, Taant,
            Ikkat, Kani Silk, Mashru Silk, Modal Silk and Designer Sarees
            as well. Our sarees are perfect for every woman who is
            seeking authenticity in their fashion statement along with
            style.
          </p>
        </div>
      </section>

      <section className="about-row reverse">
        <div className="about-text vision-text">
          <h2>Our Vision</h2>

          <p>
            Our vision is to create a global community of fashion
            enthusiasts who appreciate the beauty and elegance of
            hand-crafted sarees and the unique stories behind their
            creations. By bringing traditional craftsmanship to the
            forefront, we aim to bridge the gap between the deep-rooted
            history of Indian fashion and the present modern consumers
            of fashion. Our brand collaborates occasionally with weavers
            and artisans across the country to ensure that the legacy of
            our artisans continues to thrive.
          </p>
        </div>

        <div className="about-image">
          <img
            src={asset("cat-5.jpg")}
            alt="SP Fashion Designer Collection"
          />
        </div>
      </section>

      <section className="about-row">
        <div className="about-image">
          <img
            src={asset("cat-9.jpg")}
            alt="SP Fashion Traditional Collection"
          />
        </div>

        <div className="about-text mission-text">
          <h2>Our Mission</h2>

          <p>
            Our goal is to offer a line of apparel that seamlessly blends
            modern fashion with traditional craftsmanship to create
            fashionably versatile creations that enhance the beauty of
            Indian women. Our customers love how our designs allow them
            to express their individuality and taste while enjoying
            fashion that blends with style. We seek inspiration from the
            age-old craftsmanship culture of our country and the stories
            behind every weave. With every drape in our collection, you
            can connect to the artisans behind it and the heritage they
            represent.
          </p>
        </div>
      </section>

    </div>
  );
}

export default About;