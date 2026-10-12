import "./NotFound.css";
import EmptyState from "../components/EmptyState";

function NotFound() {
  return <EmptyState title="Page not found" text="The page you are looking for does not exist." link="/" label="Go Home" />;
}

export default NotFound;
