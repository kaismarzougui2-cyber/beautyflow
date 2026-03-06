import { StrictMode, Component } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App.jsx";

class ErrorBoundary extends Component {
  constructor(props) { super(props); this.state = { error: null }; }
  static getDerivedStateFromError(error) { return { error }; }
  render() {
    if (this.state.error) {
      return (
        <div style={{ maxWidth: 430, margin: "0 auto", minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 16, padding: 24, fontFamily: "sans-serif", background: "#fdf6f0" }}>
          <div style={{ fontSize: 40 }}>✂️</div>
          <div style={{ fontWeight: 700, fontSize: 18, color: "#333" }}>BeautyFlow Pro</div>
          <div style={{ color: "#e00", fontSize: 13, background: "#fff0f0", padding: "12px 16px", borderRadius: 8, maxWidth: 360, wordBreak: "break-all" }}>
            {this.state.error.message}
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <ErrorBoundary>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </ErrorBoundary>
  </StrictMode>
);
