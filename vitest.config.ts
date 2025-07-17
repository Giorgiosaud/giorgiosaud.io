/// <reference types="vitest" />

import { getViteConfig } from "astro/config";
import path from "path";

const alias = {
	"@": path.resolve(__dirname, "./src"),
	"@firebase": path.resolve(__dirname, "./src/firebase"),
	"@lib": path.resolve(__dirname, "./src/lib"),
	"@style": path.resolve(__dirname, "./src/style"),
	"@i18n": path.resolve(__dirname, "./src/i18n"),
	"@utils": path.resolve(__dirname, "./src/utils"),
	"@components": path.resolve(__dirname, "./src/components"),
	"@layouts": path.resolve(__dirname, "./src/layouts"),
	"@assets": path.resolve(__dirname, "./src/assets"),
	"@pages": path.resolve(__dirname, "./src/pages"),
};
export default getViteConfig({
	test: {
		include: ["tests/**/*.{test,spec}.?(c|m)[jt]s?(x)"],
		environment: "happy-dom",
		env: {
			NODE_ENV: "test",
			ASTRO_DATABASE_FILE: "test.db",
		},
		alias,
	},
	resolve: {
		alias,
	},
});
