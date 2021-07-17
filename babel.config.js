module.exports = {
    presets: [
        [
            "@babel/preset-env",
            {
                // TODO Ensure this matches our support matrix.
                targets: "> 0.25%, not dead",
            },
        ],
        "@babel/preset-react",
        [
            "@babel/preset-typescript",
            {
                allExtensions: true,
                isTSX: true,
            },
        ],
    ],
    // plugins: ["@babel/plugin-transform-runtime"],
    sourceMaps: true,
};
