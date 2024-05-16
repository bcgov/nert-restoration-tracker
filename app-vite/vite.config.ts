import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import dotenv from "dotenv";

// The .env file is in the root of the project
dotenv.config({ path: "../.env" });

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  define: {
    global: {},
    APP_VERSION: JSON.stringify(process.env.npm_package_version),
    REACT_APP_MAPTILER_API_KEY: JSON.stringify(process.env.REACT_APP_MAPTILER_API_KEY),
  },
});
