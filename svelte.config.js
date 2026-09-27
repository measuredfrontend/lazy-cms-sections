import adapter from '@sveltejs/adapter-node';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';

/** @type {import('@sveltejs/kit').Config} */
export default {
	preprocess: vitePreprocess(),
	// experimental.async enables `await` in components (used only by /await-expression).
	compilerOptions: { experimental: { async: true } },
	kit: { adapter: adapter() }
};
