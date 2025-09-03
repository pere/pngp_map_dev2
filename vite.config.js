import tailwindcss from '@tailwindcss/vite';
import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';

export default defineConfig({
	plugins: [tailwindcss(), sveltekit()]
	/* 	resolve: {
		//should give preference to js files over ts files
		//if using somewhere Typescript, it must be specified here?
		extensions: ['.js', '.ts', '.svelte'] // Include TypeScript support
	} */
});
