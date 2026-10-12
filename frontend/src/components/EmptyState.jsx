import "./EmptyState.css";
import { Link } from "react-router-dom";

function EmptyState({ title, text, link = "/", label = "Continue Shopping" }) {
  return (
    <div className="empty-state">
      <h2>{title}</h2>
      <p>{text}</p>
      <Link className="btn" to={link}>{label}</Link>
    </div>
  );
}

export default EmptyState;
