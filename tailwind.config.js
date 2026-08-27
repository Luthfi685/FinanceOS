/** @type {import('tailwindcss').Config} */
export default {
    content: [
        './vendor/laravel/framework/src/Illuminate/Pagination/resources/views/*.blade.php',
        './storage/framework/views/*.php',
        './resources/views/**/*.blade.php',
        './resources/js/**/*.jsx',
        './resources/js/**/*.tsx',
    ],
    theme: {
        extend: {
            colors: {
                // ─── FinanceOS Crisp Luxury Light Palette ──────────────────
                base: {
                    DEFAULT: '#F8FAFC', // Soft Porcelain
                    card: '#FFFFFF',    // Pure White
                    hover: '#F1F5F9',
                    border: '#E2E8F0',
                    borderSubtle: '#EDF2F7',
                },
                slateText: {
                    title: '#0F172A',   // Deep Obsidian Slate
                    body: '#334155',    // Charcoal
                    muted: '#64748B',   // Muted Slate
                    light: '#94A3B8',
                },
                // Vivid Emerald (Positive / Surplus)
                emerald: {
                    DEFAULT: '#059669',
                    50:  '#ECFDF5',
                    100: '#D1FAE5',
                    500: '#10B981',
                    600: '#059669',
                    700: '#047857',
                    glow: 'rgba(5, 150, 105, 0.15)',
                },
                // Royal Sapphire (Primary Brand / CTA)
                sapphire: {
                    DEFAULT: '#2563EB',
                    50:  '#EFF6FF',
                    100: '#DBEAFE',
                    500: '#3B82F6',
                    600: '#2563EB',
                    700: '#1D4ED8',
                    glow: 'rgba(37, 99, 235, 0.15)',
                },
                // Warm Gold (Assets / Wealth)
                gold: {
                    DEFAULT: '#D97706',
                    50:  '#FFFBEB',
                    100: '#FEF3C7',
                    500: '#F59E0B',
                    600: '#D97706',
                    700: '#B45309',
                    glow: 'rgba(217, 119, 6, 0.15)',
                },
                // Rose Crimson (Expenses / Warning)
                crimson: {
                    DEFAULT: '#E11D48',
                    50:  '#FFF1F2',
                    100: '#FFE4E6',
                    500: '#F43F5E',
                    600: '#E11D48',
                    700: '#BE123C',
                    glow: 'rgba(225, 29, 72, 0.15)',
                },
            },

            fontFamily: {
                sans: ['Inter', 'system-ui', 'sans-serif'],
                display: ['Outfit', 'Inter', 'sans-serif'],
                mono: ['JetBrains Mono', 'monospace'],
            },

            boxShadow: {
                'card': '0 4px 20px -2px rgba(15, 23, 42, 0.04), 0 2px 6px -1px rgba(15, 23, 42, 0.02)',
                'card-hover': '0 12px 30px -4px rgba(15, 23, 42, 0.08), 0 4px 12px -2px rgba(15, 23, 42, 0.04)',
                'emerald-sm': '0 4px 14px 0 rgba(5, 150, 105, 0.25)',
                'sapphire-sm': '0 4px 14px 0 rgba(37, 99, 235, 0.25)',
                'gold-sm': '0 4px 14px 0 rgba(217, 119, 6, 0.25)',
                'crimson-sm': '0 4px 14px 0 rgba(225, 29, 72, 0.25)',
            },

            borderRadius: {
                'xl': '0.875rem',
                '2xl': '1.25rem',
                '3xl': '1.75rem',
            },
        },
    },
    plugins: [],
};
