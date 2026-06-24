/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                primary: '#9F8BE7',
                'primary-dark': '#7B68C6',
                secondary: '#FF6B6B',
                accent: '#4ECDC4',
            },
        },
    },
    plugins: [],
}