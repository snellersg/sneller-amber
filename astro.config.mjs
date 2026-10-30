import tailwindcss from "@tailwindcss/vite";
// @ts-check
import { defineConfig } from 'astro/config';
import { satteri } from "@astrojs/markdown-satteri";

// WSL doesn't deliver file-change events for projects on the Windows drive (/mnt/c/...), so poll there.
const onWindowsDriveFromWsl = process.platform === "linux" && process.cwd().startsWith("/mnt/");

// Open links in guides in a new tab, except jumps to a heading on the same page and email links.
const linksOpenInNewTab = {
	name: "links-open-in-new-tab",
	element: {
		filter: ["a"],
		/** @param {any} node @param {any} ctx */
		visit(node, ctx) {
			const href = String(node.properties?.href ?? "");
			if (href.startsWith("#") || href.startsWith("mailto:")) return;
			ctx.setProperty(node, "target", "_blank");
			ctx.setProperty(node, "rel", "noopener noreferrer");
		},
	},
};

// https://astro.build/config
export default defineConfig({
	markdown: {
		processor: satteri({ hastPlugins: [linksOpenInNewTab] }),
	},
	vite: {
		plugins: [tailwindcss()],
		server: {
			watch: onWindowsDriveFromWsl ? { usePolling: true, interval: 300 } : undefined,
		},
	},
});
