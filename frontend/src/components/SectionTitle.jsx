import "./SectionTitle.css";

function SectionTitle({ text }) {
  return (
    <div className="section-title">
      <span></span>
      <h2>{text}</h2>
      <span></span>
    </div>
  );
}

export default SectionTitle;