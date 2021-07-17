const { resolve } = require("path");

// Can add an env var in gitlab-ci to override this.
// Starting nothing to hopefully have smaller barriers.
const coveragethreshold = global.JEST_COVERAGE_THRESHOLD || 0;

module.exports = {
    testEnvironment: "jsdom",
    // setupFilesAfterEnv: [resolve(__dirname, "config/jest.setup.ts")],
    // https://jestjs.io/docs/en/configuration#coveragethreshold-object
    coverageThreshold: {
        global: {
            branches: coveragethreshold,
            functions: coveragethreshold,
            lines: coveragethreshold,
            statements: coveragethreshold,
        },
    },
    transform: {
        "^.+\\.tsx?$": "babel-jest",
    },
    testMatch: ["**/*.test.(ts|tsx)"],
    moduleDirectories: ["src", "node_modules"],
    clearMocks: true,
    maxWorkers: "45%",
};
