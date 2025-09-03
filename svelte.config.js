//import adapter from "@sveltejs/adapter-auto";
import adapter from '@sveltejs/adapter-static';
import path from 'path';

/** @type {import('@sveltejs/kit').Config} */
const config = {
	kit: {
		alias: {
			// 👇 Define alias for /src/data
			$data: path.resolve('./src/data'),
		},
		/* compilerOptions: {
			a11y: false // disable all accessibility warnings
		}, */
		// adapter-auto only supports some environments, see https://svelte.dev/docs/kit/adapter-auto for a list.
		// If your environment is not supported, or you settled on a specific environment, switch out the adapter.
		// See https://svelte.dev/docs/kit/adapters for more information about adapters.
		adapter: adapter(),
		paths: {
			base: '',
			// process.env.GITHUB_PAGES ? "/pngp_map" : "",
		},
		prerender: {
			handleMissingId: 'ignore', // 👈 or 'warn'
		},
	},
};

export default config;
