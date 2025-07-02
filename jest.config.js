module.exports = {
    testEnvironment: 'jsdom',
    setupFilesAfterEnv: ['<rootDir>/tests/helpers/setup.js'],
    testMatch: ['<rootDir>/tests/unit/**/*.test.js', '<rootDir>/tests/integration/**/*.test.js'],
    collectCoverage: true,
    collectCoverageFrom: ['src/**/*.js', '!src/**/*.test.js', '!**/node_modules/**'],
    coverageDirectory: 'coverage',
    coverageReporters: ['text', 'lcov', 'html'],
    testTimeout: 10000,
    verbose: true,
    clearMocks: true,
    restoreMocks: true,
    globals: {
        'ts-jest': {
            useESM: true
        }
    },
    transform: {
        '^.+\\.js$': [
            'babel-jest',
            { presets: [['@babel/preset-env', { targets: { node: 'current' } }]] }
        ]
    },
    moduleNameMapper: {
        '^(\\.{1,2}/.*)\\.js$': '$1'
    }
};
