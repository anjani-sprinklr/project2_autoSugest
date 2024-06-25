// import { createRequire } from 'module';
// const require = createRequire(import.meta.url);

/** @type {import('jest').Config} */
const config = {
    preset: 'ts-jest',
    testEnvironment: 'jest-environment-jsdom',
    moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx'],
    testMatch: ['<rootDir>/src/**/*.{test,spec}.{ts,tsx,jsx,js}'],
    //   transform: {
    //     '^.+\\.(t|j)sx?$': 'ts-jest',
    // },

  verbose: true,
  extensionsToTreatAsEsm: ['.ts', '.tsx'],
};

module.exports = config;
