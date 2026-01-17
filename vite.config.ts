import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";
import { nodePolyfills } from "vite-plugin-node-polyfills";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
    // Ensure SPA routing works in development
    historyApiFallback: true,
    proxy: {
      '/api': {
        target: 'http://localhost:3002',
        changeOrigin: true,
        secure: false,
      }
    }
  },
  preview: {
    // Ensure SPA routing works in preview mode
    port: 4173,
    host: "::",
  },
  plugins: [
    react(),
    nodePolyfills({
      // Enable all polyfills
      include: ['buffer', 'process', 'crypto'],
      globals: {
        Buffer: true,
        global: true,
        process: true,
      },
      protocolImports: true,
    }),
    mode === "development" && componentTagger()
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  define: {
    global: "globalThis",
  },
  optimizeDeps: {
    exclude: ["@splinetool/runtime", "@splinetool/react-spline"],
    include: ["lodash.debounce"],
  },
  build: {
    commonjsOptions: {
      include: [/lodash.debounce/, /node_modules/],
    },
    // Ensure proper source maps for debugging
    sourcemap: mode === "development",
    // Optimize for SPA
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom', 'react-router-dom'],
          ui: ['@radix-ui/react-dialog', '@radix-ui/react-dropdown-menu']
        }
      }
    }
  },
}));
