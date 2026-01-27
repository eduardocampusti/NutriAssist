/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./components/**/*.{js,ts,jsx,tsx}",
        "./pages/**/*.{js,ts,jsx,tsx}",
        "./contexts/**/*.{js,ts,jsx,tsx}",
        "./utils/**/*.{js,ts,jsx,tsx}",
        "./src/**/*.{js,ts,jsx,tsx}",
        "./*.{js,ts,jsx,tsx}"
    ],
    theme: {
        extend: {
            fontFamily: {
                sans: ['Inter', 'Outfit', 'sans-serif'],
                display: ['Outfit', 'Inter', 'sans-serif'],
            },
            colors: {
                brand: {
                    50: '#ecfdf5',
                    100: '#d1fae5',
                    200: '#a7f3d0',
                    300: '#6ee7b7',
                    400: '#34d399',
                    500: '#10b981',
                    600: '#059669', // Primary Authority
                    700: '#047857',
                    800: '#065f46',
                    900: '#064e3b',
                    950: '#022c22', // Accent
                },
                surface: {
                    50: '#f8fafc',
                    100: '#f1f5f9',
                    200: '#e2e8f0',
                    300: '#cbd5e1',
                    400: '#94a3b8',
                    500: '#64748b',
                    600: '#475569',
                    700: '#334155',
                    800: '#1e293b',
                    900: '#0f172a',
                    950: '#020617',
                }
            },
            borderRadius: {
                'none': '0px',
                'sm': '1px',
                'DEFAULT': '2px',
                'md': '3px',
                'lg': '4px', // Maximum "softness" allowed
                'xl': '6px',
                '2xl': '8px',
                '3xl': '12px',
                'full': '9999px',
            },
            boxShadow: {
                'sm': '1px 1px 0px 0px rgba(2, 44, 34, 0.05)',
                'DEFAULT': '2px 2px 0px 0px rgba(2, 44, 34, 0.05)',
                'md': '3px 3px 0px 0px rgba(2, 44, 34, 0.05)',
                'lg': '4px 4px 0px 0px rgba(2, 44, 34, 0.05)',
                'governance': '2px 2px 0px 0px #059669', // Sharp emerald shadow
                'glass': 'none', // Forbidden in strict brutalism, use borders
            }
        },
    },
    plugins: [],
}
