import { createRoot } from "react-dom/client";
import App from "./App"; // Remove .tsx extension
import "./globals.css";

createRoot(document.getElementById("root")!).render(<App />);