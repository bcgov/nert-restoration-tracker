describe("Home Page", () => {
  beforeEach(() => {
    cy.login({
      root: Cypress.env("authUrl"),
      realm: Cypress.env("authRealm"),
      username: Cypress.env("username"),
      password: Cypress.env("password"),
      client_id: Cypress.env("authClientId"),
      redirect_uri: Cypress.env("redirectUri"),
    });
  });

  afterEach(() => {
    cy.logout({
      root: Cypress.env("logoutUrl"),
      realm: Cypress.env("authRealm"),
      redirect_uri: Cypress.env("redirectUri"),
    });
  });

  it("renders the home page", () => {
    cy.visit("localhost:7100");

    const title = cy.get('[data-testid="title"]').should("exist");
    title.should("include.text", "NERT Restoration Tracker");
  });

  it("renders project list page on click", () => {
    cy.visit("localhost:7100");

    const button = cy
      .get('[data-testid="all_project_plan_toolbar"]')
      .should("exist");
    button.click();

    const title = cy.get("h1").should("exist");
    title.should("include.text", "Projects");
  });
});
