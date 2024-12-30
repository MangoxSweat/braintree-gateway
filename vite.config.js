import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';

export default defineConfig({
	plugins: [sveltekit()],
	ssr: {
		external: ['mongodb'] // Ensures mongodb is treated as an external dependency
	},
	build: {
		rollupOptions: {
			external: ['mongodb'] // Explicitly marks mongodb as an external dependency
		}
	}
});
