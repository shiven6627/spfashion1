import "./Footer.css";
import { Link } from "react-router-dom";

function Footer() {
  return (
    <footer className="footer">

      <div className="footer-inner">

        <div className="footer-column">
          <h3>Shop By</h3>

          <Link to="/category/Designer Saree">
            Designer Saree
          </Link>

          <Link to="/category/Casual Saree">
            Casual Saree
          </Link>

          <Link to="/category/Designer Kurti">
            Designer Kurti
          </Link>

          <Link to="/category/Designer Lehenga">
            Designer Lehenga
          </Link>

          <Link to="/category/Salwar Kameez">
            Salwar Kameez
          </Link>
        </div>

        <div className="footer-column">
          <h3>Quick Links</h3>

          <Link to="/">
            Home
          </Link>

          <Link to="/about">
            About
          </Link>

          <Link to="/blog">
            Blog
          </Link>

          <Link to="/contact">
            Contact
          </Link>
        </div>

        <div className="footer-column">
          <h3>Legal Links</h3>

          <Link to="/privacy">
            Privacy Policy
          </Link>

          <Link to="/terms">
            Terms &amp; Conditions
          </Link>
        </div>

        <div className="footer-column social-column">
          <h3>Follow us</h3>

          <div className="social-icons">

            <a
              href="https://www.instagram.com/"
              target="_blank"
              rel="noreferrer"
              aria-label="Instagram"
            >
              <i className="fa-brands fa-instagram"></i>
            </a>

            <a
              href="https://www.facebook.com/"
              target="_blank"
              rel="noreferrer"
              aria-label="Facebook"
            >
              <i className="fa-brands fa-facebook-f"></i>
            </a>

            <a
              href="https://twitter.com/"
              target="_blank"
              rel="noreferrer"
              aria-label="Twitter"
            >
              <i className="fa-brands fa-x-twitter"></i>
            </a>

          </div>
        </div>

      </div>

      <div className="copyright">
        © 2026 SP FASHION. All rights reserved.
      </div>

    </footer>
  );
}

export default Footer;