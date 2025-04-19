module.exports = {
    content: ["./src/**/*.{js,jsx}"],
    theme: {
        extend: {},
    },
    plugins: [],
    corePlugins: {
        // on active les utilitaires min-w-0 / min-h-0
        minWidth: true,
        minHeight: true,
    },
}
