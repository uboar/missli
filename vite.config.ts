import { defineConfig } from "vite";
import { svelte } from "@sveltejs/vite-plugin-svelte";
import tsConfigPaths from "vite-tsconfig-paths";

// Misskey.ioでアプリ認証する際HTTPSじゃないと弾かれるのでローカルでもHTTPSで動かす
import basicSsl from "@vitejs/plugin-basic-ssl";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [svelte(), basicSsl(), tsConfigPaths()],
  server: {
    https: true,
  },
  base: "/missli/",
});
