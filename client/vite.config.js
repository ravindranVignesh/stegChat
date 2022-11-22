import { resolve } from "path";
import { defineConfig } from "vite";

export default defineConfig({
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, "index.html"),
        chatRoom: resolve(__dirname, "chat-room.html"),
      },
    },
  },
});
