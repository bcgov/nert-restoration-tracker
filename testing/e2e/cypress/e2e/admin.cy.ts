describe("Home Page", () => {
  before(() => {
    cy.login();
  });

  it("renders the home page", () => {
    // cy.visit("/");

    const title = cy.get('[data-testid="title"]').should("exist");
    title.should("include.text", "NERT Restoration Tracker");

    const button = cy
      .get('[data-testid="admin_project_plan_navbar"]')
      .should("exist");
    button.click();

    const title1 = cy.get("h1").should("exist");
    title1.should("include.text", "Projects");

    cy.location("pathname").should("eq", "/admin/projects");
  });
});
