// import { createRequire } from 'module';
// const require = createRequire(import.meta.url);

export default {
    preset: 'ts-jest',
    testEnvironment: 'jest-environment-jsdom',
    moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx'],
    testMatch: ['<rootDir>/src/**/*.{test,spec}.{ts,tsx,jsx,js}'],
    transform: {
      '^.+\\.tsx?$': 'ts-jest',
    },
  };
  