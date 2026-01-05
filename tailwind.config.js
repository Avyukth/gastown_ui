import { fontFamily } from 'tailwindcss/defaultTheme';
import plugin from 'tailwindcss/plugin';

/** @type {import('tailwindcss').Config} */
export default {
	darkMode: ['class'],
	content: ['./src/**/*.{html,js,svelte,ts}'],
	safelist: ['dark'],
	theme: {
		container: {
			center: true,
			padding: '2rem',
			screens: {
				'2xl': '1400px'
			}
		},
		extend: {
			colors: {
				background: 'hsl(var(--background) / <alpha-value>)',
				foreground: 'hsl(var(--foreground) / <alpha-value>)',

				card: {
					DEFAULT: 'hsl(var(--card) / <alpha-value>)',
					foreground: 'hsl(var(--card-foreground) / <alpha-value>)'
				},
				popover: {
					DEFAULT: 'hsl(var(--popover) / <alpha-value>)',
					foreground: 'hsl(var(--popover-foreground) / <alpha-value>)'
				},

				primary: {
					DEFAULT: 'hsl(var(--primary) / <alpha-value>)',
					foreground: 'hsl(var(--primary-foreground) / <alpha-value>)'
				},
				secondary: {
					DEFAULT: 'hsl(var(--secondary) / <alpha-value>)',
					foreground: 'hsl(var(--secondary-foreground) / <alpha-value>)'
				},

				accent: {
					DEFAULT: 'hsl(var(--accent) / <alpha-value>)',
					foreground: 'hsl(var(--accent-foreground) / <alpha-value>)'
				},

				border: 'hsl(var(--border) / <alpha-value>)',
				input: 'hsl(var(--input) / <alpha-value>)',
				ring: 'hsl(var(--ring) / <alpha-value>)',

				muted: {
					DEFAULT: 'hsl(var(--muted) / <alpha-value>)',
					foreground: 'hsl(var(--muted-foreground) / <alpha-value>)'
				},

				destructive: {
					DEFAULT: 'hsl(var(--destructive) / <alpha-value>)',
					foreground: 'hsl(var(--destructive-foreground) / <alpha-value>)'
				},

				status: {
					online: 'hsl(var(--status-online) / <alpha-value>)',
					offline: 'hsl(var(--status-offline) / <alpha-value>)',
					pending: 'hsl(var(--status-pending) / <alpha-value>)',
					idle: 'hsl(var(--status-idle) / <alpha-value>)'
				},

				success: {
					DEFAULT: 'hsl(var(--success) / <alpha-value>)',
					foreground: 'hsl(var(--success-foreground) / <alpha-value>)'
				},
				warning: {
					DEFAULT: 'hsl(var(--warning) / <alpha-value>)',
					foreground: 'hsl(var(--warning-foreground) / <alpha-value>)'
				},
				info: {
					DEFAULT: 'hsl(var(--info) / <alpha-value>)',
					foreground: 'hsl(var(--info-foreground) / <alpha-value>)'
				},

				// Gas Town Dark Industrial Palette
				gas: {
					black: '#050a09',
					dark: '#0B1210',
					surface: '#131F1C',
					surfaceHighlight: '#1A2A27',
					border: '#2A3A36',
					primary: '#EF6F2E',
					primaryDim: '#B85422',
					text: '#E8E8E8',
					muted: '#6A7282',
					accent: '#3B82F6',
					error: '#EF4444'
				}
			},

			fontFamily: {
				sans: ['Inter', 'sans-serif'],
				display: ['Space Grotesk', 'sans-serif'],
				mono: ['JetBrains Mono', 'monospace']
			},

			fontSize: {
				'2xs': ['0.625rem', { lineHeight: '0.875rem' }],
				'xs': ['0.75rem', { lineHeight: '1rem' }],
				'sm': ['0.875rem', { lineHeight: '1.25rem' }],
				'base': ['1rem', { lineHeight: '1.5rem' }],
				'lg': ['1.125rem', { lineHeight: '1.75rem' }],
				'xl': ['1.25rem', { lineHeight: '1.75rem' }],
				'2xl': ['1.5rem', { lineHeight: '2rem' }],
				'3xl': ['1.875rem', { lineHeight: '2.25rem' }],
				'4xl': ['2.25rem', { lineHeight: '2.5rem' }],
				'5xl': ['3rem', { lineHeight: '1' }]
			},

			spacing: {
				'1': '0.25rem',
				'2': '0.5rem',
				'3': '0.75rem',
				'4': '1rem',
				'5': '1.25rem',
				'6': '1.5rem',
				'7': '1.75rem',
				'8': '2rem',
				'9': '2.25rem',
				'10': '2.5rem',
				'11': '2.75rem',
				'12': '3rem',
				'touch': 'var(--touch-target-min)'
			},

			borderRadius: {
				'sm': '0.25rem',
				'md': '0.375rem',
				'lg': '0.5rem',
				'xl': '0.75rem',
				'2xl': '1rem',
				'full': '9999px',
				DEFAULT: 'var(--radius)'
			},

			boxShadow: {
				'sm': 'var(--shadow-sm)',
				'md': 'var(--shadow-md)',
				'lg': 'var(--shadow-lg)',
				'xl': 'var(--shadow-xl)',
				'glow': 'var(--shadow-glow)',
				'focus': 'var(--shadow-focus)',
				// Gas Town glow effects
				'glow-primary': '0 0 20px -5px #EF6F2E, 0 0 40px -10px #B85422',
				'glow-accent': '0 0 20px -5px #3B82F6, 0 0 40px -10px #1D4ED8'
			},

			minHeight: {
				'touch': 'var(--touch-target-min)'
			},
			minWidth: {
				'touch': 'var(--touch-target-min)'
			},

			animationDelay: {
				'0': '0ms',
				'100': '100ms',
				'200': '200ms',
				'300': '300ms',
				'400': '400ms',
				'500': '500ms',
				'600': '600ms',
				'700': '700ms',
				'800': '800ms'
			},

			keyframes: {
				'fade-in': {
					from: { opacity: '0' },
					to: { opacity: '1' }
				},
				'fade-in-up': {
					from: { opacity: '0', transform: 'translateY(10px)' },
					to: { opacity: '1', transform: 'translateY(0)' }
				},

				'gradient-x': {
					'0%, 100%': { backgroundPosition: '0% 50%' },
					'50%': { backgroundPosition: '100% 50%' }
				},
				'gradient-y': {
					'0%, 100%': { backgroundPosition: '50% 0%' },
					'50%': { backgroundPosition: '50% 100%' }
				},

				// Performance-optimized: uses transform instead of backgroundPosition
				'shimmer': {
					'0%': { transform: 'translateX(-100%)' },
					'100%': { transform: 'translateX(100%)' }
				},

				// Performance-optimized: uses only transform/opacity (composited properties)
				'blur-fade-up': {
					'0%': { opacity: '0', transform: 'translateY(20px) scale(0.98)' },
					'100%': { opacity: '1', transform: 'translateY(0) scale(1)' }
				},
				'blur-fade-down': {
					'0%': { opacity: '0', transform: 'translateY(-20px) scale(0.98)' },
					'100%': { opacity: '1', transform: 'translateY(0) scale(1)' }
				},
				'blur-fade-left': {
					'0%': { opacity: '0', transform: 'translateX(20px) scale(0.98)' },
					'100%': { opacity: '1', transform: 'translateX(0) scale(1)' }
				},
				'blur-fade-right': {
					'0%': { opacity: '0', transform: 'translateX(-20px) scale(0.98)' },
					'100%': { opacity: '1', transform: 'translateX(0) scale(1)' }
				},

				'grid-pulse': {
					'0%, 100%': { opacity: '0.3' },
					'50%': { opacity: '0.6' }
				},

				'border-beam': {
					'0%': { backgroundPosition: '0% 0%' },
					'100%': { backgroundPosition: '200% 0%' }
				},

				// Performance-optimized: uses opacity instead of animating box-shadow
				'glow-pulse': {
					'0%, 100%': { opacity: '0.5' },
					'50%': { opacity: '1' }
				},

				'pulse-status': {
					'0%, 100%': { opacity: '1' },
					'50%': { opacity: '0.5' }
				},

				'blink': {
					'0%, 100%': { opacity: '1' },
					'50%': { opacity: '0' }
				},

				'spin': {
					from: { transform: 'rotate(0deg)' },
					to: { transform: 'rotate(360deg)' }
				},

				'scale-in': {
					from: { opacity: '0', transform: 'scale(0.95)' },
					to: { opacity: '1', transform: 'scale(1)' }
				},

				'scale-out': {
					from: { opacity: '1', transform: 'scale(1)' },
					to: { opacity: '0', transform: 'scale(0.95)' }
				},

				'shake': {
					'0%, 100%': { transform: 'translateX(0)' },
					'10%, 30%, 50%, 70%, 90%': { transform: 'translateX(-4px)' },
					'20%, 40%, 60%, 80%': { transform: 'translateX(4px)' }
				},

				'bounce': {
					'0%, 100%': { transform: 'translateY(0)' },
					'50%': { transform: 'translateY(-10px)' }
				},

				'slide-in-up': {
					from: { opacity: '0', transform: 'translateY(100%)' },
					to: { opacity: '1', transform: 'translateY(0)' }
				},
				'slide-in-down': {
					from: { opacity: '0', transform: 'translateY(-100%)' },
					to: { opacity: '1', transform: 'translateY(0)' }
				},
				'slide-in-left': {
					from: { opacity: '0', transform: 'translateX(-100%)' },
					to: { opacity: '1', transform: 'translateX(0)' }
				},
				'slide-in-right': {
					from: { opacity: '0', transform: 'translateX(100%)' },
					to: { opacity: '1', transform: 'translateX(0)' }
				}
			},

			animation: {
				'fade-in': 'fade-in var(--duration-normal, 200ms) var(--ease-out, ease-out)',
				'fade-in-up': 'fade-in-up var(--duration-normal, 200ms) var(--ease-out, ease-out)',

				'gradient-x': 'gradient-x 3s ease infinite',
				'gradient-y': 'gradient-y 3s ease infinite',

				'shimmer': 'shimmer 2s infinite linear',

				'blur-fade-up': 'blur-fade-up 0.5s ease-out forwards',
				'blur-fade-down': 'blur-fade-down 0.5s ease-out forwards',
				'blur-fade-left': 'blur-fade-left 0.5s ease-out forwards',
				'blur-fade-right': 'blur-fade-right 0.5s ease-out forwards',

				'grid-pulse': 'grid-pulse 4s ease-in-out infinite',
				'border-beam': 'border-beam 2s linear infinite',

				'glow-pulse': 'glow-pulse 2s ease-in-out infinite',

				'pulse-status': 'pulse-status 2s infinite',

				'blink': 'blink 1s step-end infinite',
				'spin': 'spin 1s linear infinite',
				'spin-slow': 'spin 2s linear infinite',
				'spin-fast': 'spin 0.5s linear infinite',

				'scale-in': 'scale-in var(--duration-fast, 150ms) var(--ease-out, ease-out)',
				'scale-out': 'scale-out var(--duration-fast, 150ms) var(--ease-in, ease-in)',

				'shake': 'shake 0.5s ease-in-out',
				'bounce': 'bounce 0.6s ease-in-out infinite',

				'slide-in-up': 'slide-in-up 0.3s ease-out',
				'slide-in-down': 'slide-in-down 0.3s ease-out',
				'slide-in-left': 'slide-in-left 0.3s ease-out',
				'slide-in-right': 'slide-in-right 0.3s ease-out'
			}
		}
	},
	plugins: [
		plugin(function ({ matchUtilities, theme }) {
			matchUtilities(
				{
					'delay': (value) => ({
						animationDelay: value
					})
				},
				{ values: theme('animationDelay') }
			);
		})
	]
};
