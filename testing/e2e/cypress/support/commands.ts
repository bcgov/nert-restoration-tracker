// ***********************************************
// This example commands.js shows you how to
// create various custom commands and overwrite
// existing commands.
//
// For more comprehensive examples of custom
// commands please read more here:
// https://on.cypress.io/custom-commands
// ***********************************************
//
//
// -- This is a parent command --
// Cypress.Commands.add('login', (email, password) => { ... })
//
//
// -- This is a child command --
// Cypress.Commands.add('drag', { prevSubject: 'element'}, (subject, options) => { ... })
//
//
// -- This is a dual command --
// Cypress.Commands.add('dismiss', { prevSubject: 'optional'}, (subject, options) => { ... })
//
//
// -- This will overwrite an existing command --
// Cypress.Commands.overwrite('visit', (originalFn, url, options) => { ... })

// import "cypress-keycloak";

// Hydrate baseUrl from the environment variables
Cypress.config("baseUrl", Cypress.env("CYPRESS_BASE_URL"));

// Cypress.Commands.overwrite("login", (originalFn) => {
//   originalFn({
//     root: Cypress.env("authUrl"),
//     realm: Cypress.env("authRealm"),
//     username: Cypress.env("username"),
//     password: Cypress.env("password"),
//     client_id: Cypress.env("authClientId"),
//     redirect_uri: Cypress.env("redirectUri"),
//   });
// });

// Cypress.Commands.overwrite("logout", (originalFn) => {
//   originalFn({
//     root: Cypress.env("logoutUrl"),
//     realm: Cypress.env("authRealm"),
//     post_logout_redirect_uri: Cypress.env("redirectUri"),
//   });
// });
