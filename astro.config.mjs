import tailwindcss from "@tailwindcss/vite";
// @ts-check
import { defineConfig } from 'astro/config';

// WSL doesn't deliver file-change events for projects on the Windows drive (/mnt/c/...), so poll there.
const onWindowsDriveFromWsl = process.platform === "linux" && process.cwd().startsWith("/mnt/");

// https://astro.build/config
export default defineConfig({
	vite: {
		plugins: [tailwindcss()],
		server: {
			watch: onWindowsDriveFromWsl ? { usePolling: true, interval: 300 } : undefined,
		},
	},
});
