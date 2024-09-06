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
// import "cypress-localstorage-commands";

//   Cypress.Commands.overwrite("logout", (originalFn: any) => {
//     originalFn({
//       root: Cypress.env("logoutUrl"),
//       realm: Cypress.env("authRealm"),
//       post_logout_redirect_uri: Cypress.env("redirectUri"),
//     });
//   });

// Hydrate baseUrl from the environment variables
// Cypress.config("baseUrl", Cypress.env("baseUrl"));

// Cypress.Commands.add("stubAuth", () => {
//   cy.stub();
// });

// Cypress.Commands.add("stubToken", () => {
//   cy.intercept(
//     "POST",
//     "https://dev.loginproxy.gov.bc.ca/auth/realms/standard/protocol/openid-connect/token",
//     {
//       fixtures: "auth/token.env.json",
//     }
//   );
// });

// Cypress.Commands.add("stubUserInfo", () => {
//   cy.intercept(
//     "GET",
//     "https://dev.loginproxy.gov.bc.ca/auth/realms/standard/protocol/openid-connect/userinfo",
//     {
//       fixtures: "auth/userinfo.env.json",
//     }
//   );
// });

// Cypress.Commands.add("stubSelf", () => {
//   cy.intercept("GET", "/api/user/self", {
//     fixtures: "auth/self.env.json",
//   });
// });
