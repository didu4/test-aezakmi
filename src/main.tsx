import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App";
import { AuthProvider } from "./context/AuthProvider";
import { CardProvider } from "./context/CardProvider";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <AuthProvider>
      <CardProvider>
        <App />
      </CardProvider>
    </AuthProvider>
  </StrictMode>,
);
