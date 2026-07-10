export default {
    theme: {
        extend: {
            animation: {
                'fade-in': 'fadeIn 0.25s ease-in-out',
            },
            keyframes: {
                fadeIn: {
                    '0%': { opacity: 0, transform: 'translateY(-4px)' },
                    '100%': { opacity: 1, transform: 'translateY(0)' },
                },
            },
        },
    },
};
