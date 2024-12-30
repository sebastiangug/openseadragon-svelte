import { Config } from 'tailwindcss';
import { colors } from './src/lib/tailwind/colors';
import { fontFamily } from './src/lib/tailwind/typography';

// @ts-ignore-next-line
module.exports = {
	content: ['./src/**/*.{html,js,svelte,ts}'],
	theme: {
		extend: {
			colors
		},
		fontFamily
	},
	safelist: [
		'group-hover:!fill-cyan-400'
		// 'flex',
		// 'justify-center',
		// 'items-center',
		// 'flex-col',
		// 'absolute',
		// 'inset-0',
		// 'rounded',
		// 'border-4',
		// 'border-transparent',
		// 'blur-md',
		// 'text-xl',
		// {
		// 	pattern: /^opacity-/
		// },
		// {
		// 	pattern: /^bg-gradient-to-/
		// },
		// {
		// 	pattern: /^from-emerald-/
		// },
		// {
		// 	pattern: /^to-emerald-/
		// },
		// {
		// 	pattern: /^from-teal-/
		// },
		// {
		// 	pattern: /^to-teal-/
		// },
		// {
		// 	pattern: /^via-/
		// },
		// {
		// 	pattern: /^text-slate-/
		// },
		// {
		// 	pattern: /^drop-shadow-/
		// }
	]
} as Config;
