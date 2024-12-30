import { defineConfig } from 'vite';
import { sveltekit } from '@sveltejs/kit/vite';

export default defineConfig({
	plugins: [sveltekit()],
	ssr: {
		external: ['mongodb'], // Exclude mongodb from SSR bundling
		noExternal: ['mongodb'] // Ensure mongodb is not bundled for SSR
	},
	rollupOptions: {
		external: ['mongodb'], // Exclude mongodb from client-side bundle
		output: {
			globals: {
				mongodb: 'mongodb'
			}
		}
	},
		}
	},
	optimizeDeps: {
		exclude: ['mongodb'] // Prevent pre-bundling of mongodb
	}
});
