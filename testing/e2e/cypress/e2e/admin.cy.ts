describe("Admin User", () => {
  const username = String(Cypress.env("adminUser"));
  const creator = String(Cypress.env("creatorUser"));
  const password = Cypress.env("password");

  beforeEach(() => {
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

  it("renders the Manage User Page and updates User role", () => {
    const button = cy.get('[data-testid="manage_users"]').should("exist");
    button.click();

    const header = cy
      .get('[data-testid="manage_users_header"]')
      .should("exist");
    header.should("include.text", "Manage Users");

    cy.get('[data-testid="active-users-table"]').should("exist");

    cy.get(`[data-testid="active-user-row-${creator.toLowerCase()}"]`).within(
      ($row) => {
        const roleMenuButton = cy
          .get('[data-testid="custom-menu-button-Creator"]')
          .should("exist");

        roleMenuButton.first().click();
      }
    );

    const roleMenuItem = cy
      .get('[data-testid="custom-menu-button-item-Maintainer"]')
      .should("exist");
    roleMenuItem.click();

    cy.get('[data-testid="yes-button"]').should("exist").click();

    cy.get(`[data-testid="active-user-row-${creator.toLowerCase()}"]`).within(
      ($row) => {
        const roleMenuButton = cy
          .get('[data-testid="custom-menu-button-Maintainer"]')
          .should("exist");

        roleMenuButton.first().click();
      }
    );

    const roleMenuItem2 = cy
      .get('[data-testid="custom-menu-button-item-Creator"]')
      .should("exist");
    roleMenuItem2.click();

    cy.get('[data-testid="yes-button"]').should("exist").click();

    cy.get(`[data-testid="active-user-row-${creator.toLowerCase()}"]`).within(
      ($row) => {
        const MenuButton = cy
          .get('[data-testid="custom-menu-icon-Actions"]')
          .should("exist");

        MenuButton.first().click();
      }
    );

    const menuButton = cy
      .get('[data-testid="custom-menu-icon-item-UserDetails"]')
      .should("exist");
    menuButton.click();

    cy.get('[data-testid="user-detail-title"]')
      .should("exist")
      .contains(creator.toLowerCase());

    cy.get('[data-testid="user-role-chip"]').contains("Creator");
  });
});
