import { defineConfig } from 'vite';
import { sveltekit } from '@sveltejs/kit/vite';

export default defineConfig({
	plugins: [sveltekit()],
	ssr: {
		external: ['mongodb', 'src/lib/mongo.js'] // Exclude mongodb from SSR bundling
	},
	build: {
		rollupOptions: {
			external: ['mongodb', 'src/lib/mongo.js'] // Exclude mongodb from client-side bundle
		}
	},
	optimizeDeps: {
		exclude: ['mongodb', 'src/lib/mongo.js'] // Prevent pre-bundling of mongodb
	}
});
