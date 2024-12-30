import { defineConfig } from 'vite';
import { sveltekit } from '@sveltejs/kit/vite';

export default defineConfig({
	plugins: [sveltekit()],
	ssr: {
		external: ['mongodb'] // Exclude mongodb from SSR bundling
	},
	build: {
		rollupOptions: {
			external: ['mongodb'] // Exclude mongodb from client-side bundle
		}
	},
	optimizeDeps: {
		exclude: ['mongodb'] // Prevent pre-bundling of mongodb
	}
});
