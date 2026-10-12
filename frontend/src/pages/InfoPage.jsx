import "./InfoPage.css";
import { Link } from "react-router-dom";

function InfoPage({ title, children }) {
  return (
    <div className="page-shell text-page">
      <div className="shop-heading"><h1>{title}</h1></div>
      {children}
      <p><Link to="/" className="pink">← Back to Home</Link></p>
    </div>
  );
}

export default InfoPage;
