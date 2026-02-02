export default {
  testEnvironment: 'node',
  transform: {},
  moduleFileExtensions: ['js', 'mjs'],
  testMatch: ['**/tests/**/*.test.js'],
  verbose: true
  // Note: phase1/2/3-test.js files use console.log assertions + process.exit()
  // and need to be converted to proper Jest tests (technical debt)
};
