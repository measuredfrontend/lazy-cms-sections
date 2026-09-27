import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';

export default defineConfig({
	plugins: [sveltekit()],
	// Emit .vite/manifest.json so we can map section files -> chunk files (used in part 3).
	build: { manifest: true }
});
