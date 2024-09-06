describe("Home Page", () => {
  beforeEach(() => {
    cy.clearLocalStorage();
    cy.clearCookies();
    
    cy.stubToken();
    cy.stubUserInfo();
    cy.stubSelf();
  });

  it("renders the home page", () => {
    cy.visit("/");

    const title = cy.get('[data-testid="title"]').should("exist");
    title.should("include.text", "NERT Restoration Tracker");
  });

  it("renders project list page on click", () => {
    cy.visit("/");

    const button = cy
      .get('[data-testid="all_project_plan_navbar"]')
      .should("exist");
    button.click();

    const title = cy.get("h1").should("exist");
    title.should("include.text", "Projects");

    cy.location("pathname").should("eq", "/projects");
  });
});
