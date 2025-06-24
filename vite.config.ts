import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react-swc";
import { VitePWA } from "vite-plugin-pwa";
import { defineConfig, loadEnv } from "vite";
import path from "path";

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), ['VITE_', 'PUBLIC_']); // Carga ambos prefijos
  
  return {
    plugins: [
      react(),
      tailwindcss(),
      VitePWA({
        registerType: "autoUpdate",
        includeAssets: [
          "favicon.ico",
          "apple-touch-icon.png",
          "android-chrome-192x192.png",
          "android-chrome-512x512.png",
          "favicon-16x16.png",
          "favicon-32x32.png",
        ],
        workbox: {
          maximumFileSizeToCacheInBytes: 3000000,
        },
      }),
    ],
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },
    build: {
      outDir: "dist",
    },
    define: {
      "import.meta.env.VITE_GEMINI_KEY": JSON.stringify(
        env.PUBLIC_GEMINI_KEY || env.VITE_GEMINI_KEY || ""
      ),
      "import.meta.env.VITE_CLERK_PUBLISHABLE_KEY": JSON.stringify(
        env.VITE_CLERK_PUBLISHABLE_KEY || ""
      ),
    },
  };
});