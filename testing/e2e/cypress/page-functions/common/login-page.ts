/// <reference types="cypress" />

export function navigate() {
  cy.kcLogout();
  cy.kcLogin("user");
  cy.visit("/");
}

export function logout() {
  cy.wait(100);
  cy.get('a[data-testid="menu_log_out"]').click();
  cy.wait(1000);
}
