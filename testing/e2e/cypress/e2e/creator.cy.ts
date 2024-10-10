import { projectData } from "cypress/fixtures/project";

describe("Home Page", () => {
  const username = String(Cypress.env("creatorUser"));
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

  it("renders all Project Details and data is hidden from the public", () => {
    cy.get('[data-testid="all_project_plan_navbar"]').click();

    cy.get('[data-testid="hide-projects-list-button"]')
      .click()
      .then(() => {
        cy.get('[data-testid="project_table"]');

        cy.get(
          `button[data-testid="project-${projectData.project.project_name}-link"]`
        )
          .first()
          .click()
          .then(() => {
            const info = cy
              .get('[data-testid="view_project_page_component"]')
              .should("exist");
            info.should("include.text", projectData.project.project_name);

            const contact = cy
              .get('[data-testid="contact-card"]')
              .should("exist");
            contact.should("include.text", "Organization: Not Public");

            const funding = cy
              .get('[data-testid="funding_data"]')
              .should("exist");
            funding.should("include.text", "Not Public");
          });
      });
  });

  it("renders all Plan Details and data is hidden from the public", () => {
    cy.get('[data-testid="all_project_plan_navbar"]').click();

    cy.get('[data-testid="hide-plans-list-button"]')
      .click()
      .then(() => {
        cy.get('[data-testid="plan_table"]');

        cy.get(
          `button[data-testid="plan-${projectData.project.project_name}-link"]`
        )
          .first()
          .click()
          .then(() => {
            const info = cy
              .get('[data-testid="view_plan_page_component"]')
              .should("exist");
            info.should("include.text", projectData.project.project_name);

            const contact = cy
              .get('[data-testid="contact-card"]')
              .should("exist");
            contact.should("include.text", "Organization: Not Public");
          });
      });
  });
});
