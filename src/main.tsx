import { createRoot } from "react-dom/client";
import "./styles/main.scss";
import App from "./App";
import { AuthProvider } from "./context/AuthProvider";

createRoot(document.getElementById("root")!).render(
  <AuthProvider>
    <App />
  </AuthProvider>,
);
