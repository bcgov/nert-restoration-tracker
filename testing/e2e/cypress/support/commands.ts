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

// Hydrate baseUrl from the environment variables
// UNCOMMENT THIS BLOCK TO USE ENVIRONMENT VARIABLES for LOCAL TESTING
Cypress.config("baseUrl", Cypress.env("baseUrl"));

Cypress.Commands.add("login", (username, password) => {
  cy.session([username, password], () => {
    cy.visit("/");

    const button = cy.get('[data-testid="menu_log_in"]').should("exist");
    button.click();

    cy.get('[id="social-bceidbasic"]').click();

    cy.get('[id="user"]').type(username);
    cy.get('[id="password"]').type(password);

    cy.get('[type="submit"]').click();

    cy.url().should("contain", "/search");
  });
});
