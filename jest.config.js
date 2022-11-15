module.exports = {
    testEnvironment: "jsdom",
    transform: {
        "^.+\\.tsx?$": "ts-jest",
    },
    testMatch: ["**/*.test.(ts|tsx)"],
    moduleDirectories: ["src", "node_modules"],
    clearMocks: true,
    maxWorkers: "45%",
};
