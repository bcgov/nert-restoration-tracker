describe("Home Page", () => {
  const username = String(Cypress.env("creatorUser"));
  const password = Cypress.env("password");

  before(() => {
    cy.visit("/");

    const button = cy.get('[data-testid="menu_log_in"]').should("exist");
    button.click();

    cy.get('[id="social-bceidbasic"]').click();

    cy.get('[id="user"]').type(username);
    cy.get('[id="password"]').type(password);

    cy.get('[type="submit"]').click();
  });

  it("renders the home page and username", () => {
    const title = cy.get('[data-testid="title"]').should("exist");
    title.should("include.text", "NERT Restoration Tracker");

    cy.get('[data-testid="username"]').contains(username.toLowerCase());
  });
});
