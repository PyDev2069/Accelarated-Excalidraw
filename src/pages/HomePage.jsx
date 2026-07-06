import { Link } from "react-router-dom";

function HomePage() {
  return (
    <div style={homeStyle}>
      <h1>My App</h1>
      <p>Choose what you'd like to do.</p>
      <div style={{ display: "flex", flexDirection: "column", gap: 12, marginTop: 24 }}>
        <Link to="/board" style={buttonStyle}>Open Whiteboard</Link>
      </div>
    </div>
  );
}
export default HomePage;