const preset = require("jest-expo/jest-preset");
module.exports = {
  ...preset,
  transform: { ...preset.transform, "^.+\\.mjs$": "babel-jest" },
  testMatch: ["**/tests/**/*.native.test.tsx"],
  moduleNameMapper: { "^@/(.*)$": "<rootDir>/src/$1" },
  setupFilesAfterEnv: ["<rootDir>/tests/setup.native.js"],
  transformIgnorePatterns: [
    "node_modules/(?!((jest-)?react-native|@react-native|@react-native-community|expo|@expo|@react-navigation|nativewind|lucide-react-native))",
  ],
};
