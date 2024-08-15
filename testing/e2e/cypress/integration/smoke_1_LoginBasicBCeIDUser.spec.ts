import { navigate } from "../page-functions/common/login-page";

beforeEach(() => {
  cy.logout();
  //   cy.get('button[data-testid="login"]').click();
  cy.login();
  navigate();
  //   login(Cypress.env("username"), Cypress.env("password"));
});

afterEach(() => {
  navigate();
//   cy.logout();
});

it("should login and logout", function () {
  cy.wait(5000);
  cy.get('a[data-testid="menu_log_in"]').should("exist");
//   cy.get('button[data-testid="login"]').click();

//   cy.contains("Basic BCeID").should("exist");
//   cy.contains("Basic BCeID").click();
});
