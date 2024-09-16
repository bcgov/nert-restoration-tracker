describe("Home Page", () => {
  const username = String(Cypress.env("maintainerUser"));
  const password = Cypress.env("password");

  beforeEach(() => {
    cy.login(username, password);
    cy.visit("/");
  });

  it("renders the home page and username", () => {
    const title = cy.get('[data-testid="title"]').should("exist");
    title.should("include.text", "NERT Restoration Tracker");

    cy.get('[data-testid="username"]').contains(username.toLowerCase());
  });
});
