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
				sans: ['Inter', 'system-ui', '-apple-system', ...fontFamily.sans],
				display: ['Space Grotesk', 'system-ui', '-apple-system', ...fontFamily.sans],
				mono: ['JetBrains Mono', 'SF Mono', 'Fira Code', ...fontFamily.mono]
			},

			fontSize: {
				// === Base Scale ===
				'2xs': ['0.625rem', { lineHeight: '0.875rem' }],
				'xs': ['0.75rem', { lineHeight: '1rem' }],
				'sm': ['0.875rem', { lineHeight: '1.25rem' }],
				'base': ['1rem', { lineHeight: '1.5rem' }],
				'lg': ['1.125rem', { lineHeight: '1.75rem' }],
				'xl': ['1.25rem', { lineHeight: '1.75rem' }],
				'2xl': ['1.5rem', { lineHeight: '2rem' }],
				'3xl': ['1.875rem', { lineHeight: '2.25rem' }],
				'4xl': ['2.25rem', { lineHeight: '2.5rem' }],
				'5xl': ['3rem', { lineHeight: '1' }],
				'6xl': ['3.75rem', { lineHeight: '1' }],
				'7xl': ['4.5rem', { lineHeight: '1' }],

				// === Display Typography (for hero sections, headlines) ===
				'display-2xl': ['4.5rem', { lineHeight: '1', letterSpacing: '-0.02em', fontWeight: '700' }],
				'display-xl': ['3.75rem', { lineHeight: '1.1', letterSpacing: '-0.02em', fontWeight: '700' }],
				'display-lg': ['3rem', { lineHeight: '1.1', letterSpacing: '-0.02em', fontWeight: '600' }],
				'display-md': ['2.25rem', { lineHeight: '1.2', letterSpacing: '-0.01em', fontWeight: '600' }],
				'display-sm': ['1.875rem', { lineHeight: '1.2', letterSpacing: '-0.01em', fontWeight: '600' }],

				// === Body Typography ===
				'body-lg': ['1.125rem', { lineHeight: '1.75rem' }],
				'body-md': ['1rem', { lineHeight: '1.625rem' }],
				'body-sm': ['0.875rem', { lineHeight: '1.5rem' }],
				'body-xs': ['0.75rem', { lineHeight: '1.25rem' }],

				// === Label Typography (for UI labels, buttons, form labels) ===
				'label-lg': ['0.9375rem', { lineHeight: '1.25rem', fontWeight: '500', letterSpacing: '0.01em' }],
				'label-md': ['0.875rem', { lineHeight: '1.25rem', fontWeight: '500', letterSpacing: '0.01em' }],
				'label-sm': ['0.75rem', { lineHeight: '1rem', fontWeight: '500', letterSpacing: '0.02em' }],
				'label-xs': ['0.625rem', { lineHeight: '0.875rem', fontWeight: '500', letterSpacing: '0.04em' }],

				// === Code Typography ===
				'code': ['0.8125rem', { lineHeight: '1.5rem' }]
			},

			// === Letter Spacing Scale ===
			letterSpacing: {
				'tighter': '-0.05em',
				'tight': '-0.025em',
				'normal': '0em',
				'wide': '0.025em',
				'wider': '0.05em',
				'widest': '0.1em'
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
				// === 5-Level Shadow System ===
				'xs': 'var(--shadow-xs)',
				'sm': 'var(--shadow-sm)',
				'md': 'var(--shadow-md)',
				'lg': 'var(--shadow-lg)',
				'xl': 'var(--shadow-xl)',
				'2xl': 'var(--shadow-2xl)',
				'inner': 'var(--shadow-inner)',
				'none': 'none',

				// === Utility Shadows ===
				'glow': 'var(--shadow-glow)',
				'focus': 'var(--shadow-focus)',

				// === Colored Status Shadows (for glow effects) ===
				'glow-primary': '0 0 20px -5px hsl(var(--primary) / 0.5), 0 0 40px -10px hsl(var(--primary) / 0.3)',
				'glow-success': '0 0 20px -5px hsl(var(--success) / 0.5), 0 0 40px -10px hsl(var(--success) / 0.3)',
				'glow-warning': '0 0 20px -5px hsl(var(--warning) / 0.5), 0 0 40px -10px hsl(var(--warning) / 0.3)',
				'glow-destructive': '0 0 20px -5px hsl(var(--destructive) / 0.5), 0 0 40px -10px hsl(var(--destructive) / 0.3)',
				'glow-info': '0 0 20px -5px hsl(var(--info) / 0.5), 0 0 40px -10px hsl(var(--info) / 0.3)',
				'glow-accent': '0 0 20px -5px hsl(var(--accent) / 0.5), 0 0 40px -10px hsl(var(--accent) / 0.3)',

				// === Elevation Shadows (card/popover depth) ===
				'elevation-1': 'var(--shadow-sm)',
				'elevation-2': 'var(--shadow-md)',
				'elevation-3': 'var(--shadow-lg)',
				'elevation-4': 'var(--shadow-xl)',
				'elevation-5': 'var(--shadow-2xl)'
			},

			minHeight: {
				'touch': 'var(--touch-target-min)'
			},
			minWidth: {
				'touch': 'var(--touch-target-min)'
			},

			// === Transition Duration Scale ===
			transitionDuration: {
				'instant': 'var(--duration-instant)',
				'fast': 'var(--duration-fast)',
				'normal': 'var(--duration-normal)',
				'slow': 'var(--duration-slow)',
				'slower': 'var(--duration-slower)',
				'0': '0ms',
				'75': '75ms',
				'100': '100ms',
				'150': '150ms',
				'200': '200ms',
				'300': '300ms',
				'500': '500ms',
				'700': '700ms',
				'1000': '1000ms'
			},

			// === Transition Timing Functions ===
			transitionTimingFunction: {
				'ease-out-expo': 'cubic-bezier(0.16, 1, 0.3, 1)',
				'ease-out-quart': 'cubic-bezier(0.25, 1, 0.5, 1)',
				'ease-out-back': 'cubic-bezier(0.34, 1.56, 0.64, 1)',
				'ease-spring': 'var(--ease-spring)',
				'ease-smooth': 'var(--ease-out)',
				'ease-bounce': 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
				'ease-in-expo': 'cubic-bezier(0.7, 0, 0.84, 0)',
				'ease-in-out-expo': 'cubic-bezier(0.87, 0, 0.13, 1)'
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
				},

				// Exit animations (for toast dismissal, modals, etc.)
				'fade-out': {
					from: { opacity: '1' },
					to: { opacity: '0' }
				},
				'slide-out-right': {
					from: { opacity: '1', transform: 'translateX(0)' },
					to: { opacity: '0', transform: 'translateX(100%)' }
				},
				'slide-out-down': {
					from: { opacity: '1', transform: 'translateY(0)' },
					to: { opacity: '0', transform: 'translateY(100%)' }
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
				'slide-in-right': 'slide-in-right 0.3s ease-out',

				// Exit animations
				'fade-out': 'fade-out var(--duration-normal, 200ms) ease-out forwards',
				'slide-out-right': 'slide-out-right var(--duration-normal, 200ms) ease-out forwards',
				'slide-out-down': 'slide-out-down var(--duration-normal, 200ms) ease-out forwards'
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
