import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

// Additional Tailwind CSS styles for custom fonts and colors
import { createTheme } from "@/lib/utils";

// Apply custom styles
document.documentElement.classList.add("light");

createRoot(document.getElementById("root")!).render(<App />);
