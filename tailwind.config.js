/** @type {import('tailwindcss').Config} */
export default {
    content: ['./src/**/*.{tsx,ts}', './index.html'],
    theme: {
        extend: {
            fontFamily: {
                creepy: ['Creepster', 'cursive']
            },
            colors: {
                glow: '#ff4444'
            },
            boxShadow: {
                glow: '0 0 10px rgba(255, 68, 68, 0.7)'
            }
        }
    },
    plugins: []
}