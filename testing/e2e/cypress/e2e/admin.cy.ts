import { projectData } from "cypress/fixtures/project";

describe("Admin User", () => {
  const username = String(Cypress.env("adminUser"));
  const creator = String(Cypress.env("creatorUser"));
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

  it("renders the Manage User Page, updates User role, Checks user Details Page", () => {
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

  it("renders My Projects/Plans Page, then Creates a Project", () => {
    const button = cy.get('[data-testid="my_projects_plans"]').should("exist");
    button.click();

    const header = cy.get('[data-testid="my_projects_header"]').should("exist");
    header.should("include.text", "My Projects");

    header.within(($header) => {
      const createButton = cy
        .get('[data-testid="create-project-button"]')
        .should("exist");
      createButton.click();
    });

    describe("renders the Create Project Page", () => {
      const header = cy
        .get('[data-testid="create_project_header"]')
        .should("exist");
      header.should("include.text", "Create Restoration Project");

      describe("fills in project name", () => {
        cy.get('input[name="project.project_name"]').type(
          projectData.project.project_name
        );
      });

      describe("fills in project description", () => {
        cy.get('textarea[name="project.brief_desc"]').type(
          projectData.project.brief_desc
        );
      });

      describe("fills in project dates", () => {
        cy.get('input[name="project.start_date"]').type(
          projectData.project.start_date
        );

        cy.get('input[name="project.end_date"]').type(
          projectData.project.end_date
        );

        cy.get('input[name="project.actual_start_date"]').type(
          projectData.project.actual_start_date
        );

        cy.get('input[name="project.actual_end_date"]').type(
          projectData.project.actual_end_date
        );
      });

      describe("fills in project objective", () => {
        cy.get('input[name="objective.objectives.[0].objective"]').type(
          projectData.objective.objectives[0].objective
        );
      });

      describe("selects species", () => {
        cy.get('input[name="species.focal_species"]').type("Moose{enter}");
        cy.get("[data-option-index=2]").click();
      });

      describe("selects project focus", () => {
        cy.get('input[name="focus.focuses"]').click();
        cy.get('[id="focus.focuses-option-0"]').click();
        cy.get('[id="focus.focuses-option-1"]').click();
        cy.get('input[name="focus.focuses"]').click();
      });

      describe("inputs number of people", () => {
        cy.get('input[id="numberIntId"]').type("10");
      });

      describe("adds contact user", () => {
        cy.get('[data-testid="add-contact-button"]').click();

        cy.get('form[data-testid="contact-item-form"]').within(($form) => {
          cy.get('input[name="first_name"]').type(
            projectData.contact.contacts[0].first_name
          );
          cy.get('input[name="last_name"]').type(
            projectData.contact.contacts[0].last_name
          );
          cy.get('input[name="email_address"]').type(
            projectData.contact.contacts[0].email_address
          );
          cy.get('input[name="phone_number"]').type(
            projectData.contact.contacts[0].phone_number
          );
          cy.get('input[name="organization"]').type(
            projectData.contact.contacts[0].organization
          );
          cy.get('[id="isFirstNation"]').click();
          cy.get('[id="primary_contact_details"]').click();
          cy.get('input[name="is_public"]').check("false");
        });
        cy.get('[data-testid="edit-dialog-save-button"]').click();
      });

      describe("adds funding data", () => {
        cy.get('[data-testid="add-funding-source-button"]').click();

        cy.get('form[data-testid="funding-item-form"]').within(($form) => {
          cy.get('input[name="organization_name"]').type(
            projectData.funding.fundingSources[0].organization_name
          );
          cy.get('input[name="description"]').type(
            projectData.funding.fundingSources[0].description
          );
          cy.get('input[name="funding_project_id"]').type(
            projectData.funding.fundingSources[0].funding_project_id
          );
          cy.get('input[name="funding_amount"]').type(
            String(projectData.funding.fundingSources[0].funding_amount)
          );
          cy.get('input[name="start_date"]').type(
            projectData.project.start_date
          );
          cy.get('input[name="end_date"]').type(projectData.project.end_date);
          cy.get('input[name="is_public"]').check("false");
        });
        cy.get('[data-testid="edit-dialog-save-button"]').click();
      });

      describe("adds partnership data", () => {
        cy.get('[id="partnerships-type-select"]').click();
        cy.get('[data-value="BC Government partner"]')
          .click()
          .then(() => {
            cy.get(
              'input[name="partnership.partnerships.[0].partnership_name"]'
            ).type("BC Government");
          });
      });

      describe("adds authorization data", () => {
        cy.get('[id="authorization-type-select"]').click();
        cy.get('[data-value="Forest Licence to Cut"]')
          .click()
          .then(() => {
            cy.get(
              'input[name="authorization.authorizations.[0].authorization_ref"]'
            ).type("Forest");

            cy.get(
              'input[name="authorization.authorizations.[0].authorization_desc"]'
            ).type("forest cutting");
          });
      });

      describe("adds Location data", () => {
        cy.get('[id="nrm-region-select"]').click();
        cy.get("[data-value=3637]").click();

        cy.get('[data-testid="project-boundary-upload"]')
          .click()
          .then(() => {
            cy.get('input[ data-testid="project-boundary-upload"]')
              .selectFile("cypress/fixtures/boundary.geojson", { force: true })
              .then(() => {
                cy.get('[data-testid="close_button"]').click();
              });
          });
      });

      cy.get(
        'input[name="restoration_plan.is_project_part_public_plan"]'
      ).check("true");

      cy.get('[data-testid="project-create-button"]').click();
      cy.get('[data-testid="yes-button"]').click();
    });
  });

  it("renders My Projects/Plans Page, then Creates a Plan", () => {
    const button = cy.get('[data-testid="my_projects_plans"]').should("exist");
    button.click();

    const header = cy.get('[data-testid="my_plan_header"]').should("exist");
    header.should("include.text", "My Plans");

    header.within(($header) => {
      const createButton = cy
        .get('[data-testid="create-plan-button"]')
        .should("exist");
      createButton.click();
    });

    describe("renders the Create Plan Page", () => {
      const header = cy
        .get('[data-testid="create_plan_header"]')
        .should("exist");
      header.should("include.text", "Create Restoration Plan");

      describe("fills in plan name", () => {
        cy.get('input[name="project.project_name"]').type(
          projectData.project.project_name
        );
      });

      describe("fills in plan description", () => {
        cy.get('textarea[name="project.brief_desc"]').type(
          projectData.project.brief_desc
        );
      });

      describe("fills in project dates", () => {
        cy.get('input[name="project.start_date"]').type(
          projectData.project.start_date
        );

        cy.get('input[name="project.end_date"]').type(
          projectData.project.end_date
        );
      });

      describe("selects project focus", () => {
        cy.get('input[name="focus.focuses"]').click();
        cy.get('[id="focus.focuses-option-0"]').click();
        cy.get('[id="focus.focuses-option-1"]').click();
        cy.get('input[name="focus.focuses"]').click();
      });

      describe("adds contact user", () => {
        cy.get('[data-testid="add-contact-button"]').click();

        cy.get('form[data-testid="contact-item-form"]').within(($form) => {
          cy.get('input[name="first_name"]').type(
            projectData.contact.contacts[0].first_name
          );
          cy.get('input[name="last_name"]').type(
            projectData.contact.contacts[0].last_name
          );
          cy.get('input[name="email_address"]').type(
            projectData.contact.contacts[0].email_address
          );
          cy.get('input[name="phone_number"]').type(
            projectData.contact.contacts[0].phone_number
          );
          cy.get('input[name="organization"]').type(
            projectData.contact.contacts[0].organization
          );
          cy.get('[id="isFirstNation"]').click();
          cy.get('[id="primary_contact_details"]').click();
          cy.get('input[name="is_public"]').check("false");
        });
        cy.get('[data-testid="edit-dialog-save-button"]').click();
      });

      describe("adds Location data", () => {
        cy.get('[id="nrm-region-select"]').click();
        cy.get("[data-value=3637]").click();

        cy.get('[data-testid="plan-boundary-upload"]')
          .click()
          .then(() => {
            cy.get('input[ data-testid="plan-boundary-upload"]')
              .selectFile("cypress/fixtures/boundary.geojson", { force: true })
              .then(() => {
                cy.get('[data-testid="close_button"]').click();
              });
          });
      });

      cy.get('[data-testid="plan-create-button"]').click();
      cy.get('[data-testid="yes-button"]').click();
    });
  });
});
