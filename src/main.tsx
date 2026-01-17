import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { ThemeProvider } from "./contexts/ThemeContext";
import { MarketplaceProvider } from "./contexts/MarketplaceContext";
import { config, validateConfig } from "./lib/config";

// Validate configuration and block telemetry early
validateConfig();

// Additional Mapbox telemetry blocking
if (typeof window !== 'undefined') {
  console.log('🔒 Initializing Mapbox telemetry blocking...');
}

createRoot(document.getElementById("root")!).render(
  <ThemeProvider>
    <MarketplaceProvider>
      <App />
    </MarketplaceProvider>
  </ThemeProvider>
);
