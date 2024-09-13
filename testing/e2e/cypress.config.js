const { defineConfig } = require("cypress");

module.exports = defineConfig({
  e2e: {
    supportFile: "./cypress/support/e2e.ts",
    // pluginsFile: "./cypress/plugins/index.ts",
    screenshotsFolder: "./cypress/screenshots",
    videosFolder: "./cypress/videos",
    projectId: "bq8wdr",
    chromeWebSecurity: false,
    execTimeout: 10000,
    taskTimeout: 10000,
    experimentalStudio: true,
    viewportHeight: 900,
    viewportWidth: 1440,
    // baseUrl: "http://localhost:7100",
    setupNodeEvents(on, config) {
      require("cypress-localstorage-commands/plugin")(on, config);
      return config;
      // implement node event listeners here
    },
  },
});
