/// <reference types="cypress" />

export function navigate() {
  cy.visit('/')
}

export function logout() {
  cy.wait(5000);
  cy.get('a[data-testid="menu_log_out"]').click();
  cy.wait(1000);
}
