import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

export default defineConfig(() => {
  const port = Number(process.env.FRONTEND_PORT);

  return {
    plugins: [react()],
    server: {
      host: true,
      port,
      strictPort: true,
      hmr: {
        host: "localhost",
        protocol: "ws",
      },
      watch: {
        usePolling: true,
      },
    },
  };
});