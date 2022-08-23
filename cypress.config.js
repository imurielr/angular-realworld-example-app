const { defineConfig } = require('cypress')

module.exports = defineConfig({
  viewportHeight: 1080,
  viewportWidth: 1920,
  e2e: {
    baseUrl: 'http://localhost:4200',
    specPattern: 'cypress/e2e/**/*.{js,jsx,ts,tsx}',
    excludeSpecPattern: ['**/1-getting-started/*', '**/2-advanced-examples/*']
  },
  env: {
    username: 'isamuri.r@hotmail.com',
    password: '123456789',
    apiUrl: 'https://api.realworld.io'
  },
  retries: 2
  // retries: {
  //   runMode: 2,
  //   openMode: 1
  // }
})