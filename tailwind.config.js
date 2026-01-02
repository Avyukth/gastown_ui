import { fontFamily } from 'tailwindcss/defaultTheme';

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
				// Background colors
				background: 'hsl(var(--background) / <alpha-value>)',
				foreground: 'hsl(var(--foreground) / <alpha-value>)',

				// Surface colors
				card: {
					DEFAULT: 'hsl(var(--card) / <alpha-value>)',
					foreground: 'hsl(var(--card-foreground) / <alpha-value>)'
				},
				popover: {
					DEFAULT: 'hsl(var(--popover) / <alpha-value>)',
					foreground: 'hsl(var(--popover-foreground) / <alpha-value>)'
				},

				// Primary colors
				primary: {
					DEFAULT: 'hsl(var(--primary) / <alpha-value>)',
					foreground: 'hsl(var(--primary-foreground) / <alpha-value>)'
				},
				secondary: {
					DEFAULT: 'hsl(var(--secondary) / <alpha-value>)',
					foreground: 'hsl(var(--secondary-foreground) / <alpha-value>)'
				},

				// Accent colors
				accent: {
					DEFAULT: 'hsl(var(--accent) / <alpha-value>)',
					foreground: 'hsl(var(--accent-foreground) / <alpha-value>)'
				},

				// UI element colors
				border: 'hsl(var(--border) / <alpha-value>)',
				input: 'hsl(var(--input) / <alpha-value>)',
				ring: 'hsl(var(--ring) / <alpha-value>)',

				// Muted colors
				muted: {
					DEFAULT: 'hsl(var(--muted) / <alpha-value>)',
					foreground: 'hsl(var(--muted-foreground) / <alpha-value>)'
				},

				// Destructive colors
				destructive: {
					DEFAULT: 'hsl(var(--destructive) / <alpha-value>)',
					foreground: 'hsl(var(--destructive-foreground) / <alpha-value>)'
				},

				// Status colors (semantic)
				status: {
					online: 'hsl(var(--status-online) / <alpha-value>)',
					offline: 'hsl(var(--status-offline) / <alpha-value>)',
					pending: 'hsl(var(--status-pending) / <alpha-value>)',
					idle: 'hsl(var(--status-idle) / <alpha-value>)'
				},

				// Semantic feedback colors
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
				}
			},

			// Typography - JetBrains Mono as primary mono font
			fontFamily: {
				sans: ['Inter', 'system-ui', '-apple-system', ...fontFamily.sans],
				mono: ['JetBrains Mono', 'SF Mono', 'Fira Code', ...fontFamily.mono]
			},

			// Font sizes with line heights
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

			// Spacing scale (1-12 based on 4px increments)
			spacing: {
				'1': '0.25rem',   // 4px
				'2': '0.5rem',    // 8px
				'3': '0.75rem',   // 12px
				'4': '1rem',      // 16px
				'5': '1.25rem',   // 20px
				'6': '1.5rem',    // 24px
				'7': '1.75rem',   // 28px
				'8': '2rem',      // 32px
				'9': '2.25rem',   // 36px
				'10': '2.5rem',   // 40px
				'11': '2.75rem',  // 44px
				'12': '3rem',     // 48px
				'touch': 'var(--touch-target-min)'
			},

			// Border radius
			borderRadius: {
				'sm': '0.25rem',     // 4px
				'md': '0.375rem',    // 6px
				'lg': '0.5rem',      // 8px
				'xl': '0.75rem',     // 12px
				'2xl': '1rem',       // 16px
				'full': '9999px',
				DEFAULT: 'var(--radius)'
			},

			// Box shadows
			boxShadow: {
				'sm': 'var(--shadow-sm)',
				'md': 'var(--shadow-md)',
				'lg': 'var(--shadow-lg)',
				'xl': 'var(--shadow-xl)',
				'glow': 'var(--shadow-glow)',
				'focus': 'var(--shadow-focus)'
			},

			// Touch target minimum heights/widths
			minHeight: {
				'touch': 'var(--touch-target-min)'
			},
			minWidth: {
				'touch': 'var(--touch-target-min)'
			},

			// Keyframes for animations
			keyframes: {
				// Basic fade animations
				'fade-in': {
					from: { opacity: '0' },
					to: { opacity: '1' }
				},
				'fade-in-up': {
					from: { opacity: '0', transform: 'translateY(10px)' },
					to: { opacity: '1', transform: 'translateY(0)' }
				},

				// Gradient animations (background-position based)
				'gradient-x': {
					'0%, 100%': { backgroundPosition: '0% 50%' },
					'50%': { backgroundPosition: '100% 50%' }
				},
				'gradient-y': {
					'0%, 100%': { backgroundPosition: '50% 0%' },
					'50%': { backgroundPosition: '50% 100%' }
				},

				// Shimmer effect (loading/skeleton)
				'shimmer': {
					'0%': { backgroundPosition: '-200% 0' },
					'100%': { backgroundPosition: '200% 0' }
				},

				// Blur-fade animations (opacity + transform + filter)
				'blur-fade-up': {
					'0%': { opacity: '0', transform: 'translateY(20px)', filter: 'blur(10px)' },
					'100%': { opacity: '1', transform: 'translateY(0)', filter: 'blur(0)' }
				},
				'blur-fade-down': {
					'0%': { opacity: '0', transform: 'translateY(-20px)', filter: 'blur(10px)' },
					'100%': { opacity: '1', transform: 'translateY(0)', filter: 'blur(0)' }
				},
				'blur-fade-left': {
					'0%': { opacity: '0', transform: 'translateX(20px)', filter: 'blur(10px)' },
					'100%': { opacity: '1', transform: 'translateX(0)', filter: 'blur(0)' }
				},
				'blur-fade-right': {
					'0%': { opacity: '0', transform: 'translateX(-20px)', filter: 'blur(10px)' },
					'100%': { opacity: '1', transform: 'translateX(0)', filter: 'blur(0)' }
				},

				// Grid pulse (subtle opacity pulsing for grid patterns)
				'grid-pulse': {
					'0%, 100%': { opacity: '0.3' },
					'50%': { opacity: '0.6' }
				},

				// Border beam (animated border gradient)
				'border-beam': {
					'0%': { backgroundPosition: '0% 0%' },
					'100%': { backgroundPosition: '200% 0%' }
				},

				// Glow pulse (box-shadow animation)
				'glow-pulse': {
					'0%, 100%': { boxShadow: '0 0 20px 0 hsl(var(--primary) / 0.3)' },
					'50%': { boxShadow: '0 0 40px 10px hsl(var(--primary) / 0.5)' }
				},

				// Status pulse
				'pulse-status': {
					'0%, 100%': { opacity: '1' },
					'50%': { opacity: '0.5' }
				},

				// Blink (cursor/indicator)
				'blink': {
					'0%, 100%': { opacity: '1' },
					'50%': { opacity: '0' }
				},

				// Spin (loading spinner)
				'spin': {
					from: { transform: 'rotate(0deg)' },
					to: { transform: 'rotate(360deg)' }
				},

				// Scale-in (modal/popup entrance)
				'scale-in': {
					from: { opacity: '0', transform: 'scale(0.95)' },
					to: { opacity: '1', transform: 'scale(1)' }
				},

				// Scale-out (modal/popup exit)
				'scale-out': {
					from: { opacity: '1', transform: 'scale(1)' },
					to: { opacity: '0', transform: 'scale(0.95)' }
				},

				// Shake (error/attention)
				'shake': {
					'0%, 100%': { transform: 'translateX(0)' },
					'10%, 30%, 50%, 70%, 90%': { transform: 'translateX(-4px)' },
					'20%, 40%, 60%, 80%': { transform: 'translateX(4px)' }
				},

				// Bounce (attention/notification)
				'bounce': {
					'0%, 100%': { transform: 'translateY(0)' },
					'50%': { transform: 'translateY(-10px)' }
				},

				// Slide animations
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

			// Animation utilities
			animation: {
				// Basic
				'fade-in': 'fade-in var(--duration-normal, 200ms) var(--ease-out, ease-out)',
				'fade-in-up': 'fade-in-up var(--duration-normal, 200ms) var(--ease-out, ease-out)',

				// Gradient
				'gradient-x': 'gradient-x 3s ease infinite',
				'gradient-y': 'gradient-y 3s ease infinite',

				// Shimmer
				'shimmer': 'shimmer 2s infinite linear',

				// Blur-fade (use with animate-once for entrance)
				'blur-fade-up': 'blur-fade-up 0.5s ease-out forwards',
				'blur-fade-down': 'blur-fade-down 0.5s ease-out forwards',
				'blur-fade-left': 'blur-fade-left 0.5s ease-out forwards',
				'blur-fade-right': 'blur-fade-right 0.5s ease-out forwards',

				// Grid & borders
				'grid-pulse': 'grid-pulse 4s ease-in-out infinite',
				'border-beam': 'border-beam 2s linear infinite',

				// Glow
				'glow-pulse': 'glow-pulse 2s ease-in-out infinite',

				// Status
				'pulse-status': 'pulse-status 2s infinite',

				// Utility
				'blink': 'blink 1s step-end infinite',
				'spin': 'spin 1s linear infinite',
				'spin-slow': 'spin 2s linear infinite',
				'spin-fast': 'spin 0.5s linear infinite',

				// Scale
				'scale-in': 'scale-in var(--duration-fast, 150ms) var(--ease-out, ease-out)',
				'scale-out': 'scale-out var(--duration-fast, 150ms) var(--ease-in, ease-in)',

				// Shake & bounce
				'shake': 'shake 0.5s ease-in-out',
				'bounce': 'bounce 0.6s ease-in-out infinite',

				// Slides
				'slide-in-up': 'slide-in-up 0.3s ease-out',
				'slide-in-down': 'slide-in-down 0.3s ease-out',
				'slide-in-left': 'slide-in-left 0.3s ease-out',
				'slide-in-right': 'slide-in-right 0.3s ease-out'
			}
		}
	},
	plugins: []
};
