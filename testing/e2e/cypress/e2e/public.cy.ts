describe("Home Page", () => {
  it("renders the page and Title", () => {
    cy.visit("localhost:7100");

    const title = cy.get('[data-testid="title"]').should("exist");
    title.should("include.text", "NERT Restoration Tracker");
  });

  describe("Header", () => {
    it("renders project list page on nav click", () => {
      cy.visit("localhost:7100");

      const button = cy
        .get('[data-testid="all_project_plan_navbar"]')
        .should("exist");
      button.click();

      const title = cy.get("h1").should("exist");
      title.should("include.text", "Projects");

      cy.location("pathname").should("eq", "/projects");
    });

    it("renders map page on nav click", () => {
      cy.visit("localhost:7100");

      const button = cy.get('[data-testid="map_navbar"]').should("exist");
      button.click();

      cy.location("pathname").should("eq", "/search");
    });

    it("renders ? button on header", () => {
      cy.visit("localhost:7100");

      const button = cy.get('[data-testid="help_navbar"]').should("exist");
      button.click();

      cy.get("ul li:last").should("include.text", "Need Help").click();

      cy.get("h2").should("include.text", "Need Help?");

      const disclaimer = cy
        .get(
          'a[href="mailto:cumulative-restoration-tracker-support@gov.bc.ca?subject=NERT Restoration Tracker - Support Request"]'
        )
        .should("exist");
      disclaimer.should(
        "include.text",
        "cumulative-restoration-tracker-support@gov.bc.ca"
      );
    });
  });

  describe("Footer", () => {
    it("renders the footer", () => {
      cy.visit("localhost:7100");

      const footer = cy.get('[data-testid="footer"]').should("exist");
      footer.should("include.text", "Disclaimer");
      footer.should("include.text", "Privacy");
      footer.should("include.text", "Accessibility");
      footer.should("include.text", "Copyright");
    });

    it("renders footer links", () => {
      cy.visit("localhost:7100");

      const disclaimer = cy
        .get('a[href="https://www2.gov.bc.ca/gov/content/home/disclaimer"]')
        .should("exist");
      disclaimer.should("include.text", "Disclaimer");

      const privacy = cy
        .get('a[href="https://www2.gov.bc.ca/gov/content/home/privacy"]')
        .should("exist");
      privacy.should("include.text", "Privacy");

      const accessibility = cy
        .get(
          'a[href="https://www2.gov.bc.ca/gov/content/home/accessible-government"]'
        )
        .should("exist");
      accessibility.should("include.text", "Accessibility");

      const copyright = cy
        .get('a[href="https://www2.gov.bc.ca/gov/content/home/copyright"]')
        .should("exist");
      copyright.should("include.text", "Copyright");
    });
  });
});

describe("Project List Page", () => {
  it("renders the page and Title", () => {
    cy.visit("localhost:7100/projects");

    const title = cy.get("h1").should("exist");
    title.should("include.text", "Projects");
  });

  it("renders the project list", () => {
    cy.visit("localhost:7100/projects");

    const projectList = cy.get('[data-testid="project_list"]').should("exist");
    projectList.should("have.length", 1);

    const dropdown = cy
      .get('[data-testid="hide-projects-list-button"]')
      .should("exist");
    dropdown.click();

    const project = cy.get('[data-testid="project_1"]').should("exist");
    project.should("have.length", 1);
  });

  it("renders the project details page on project click", () => {
    cy.visit("localhost:7100/projects");

    const projectList = cy.get('[data-testid="project_list"]').should("exist");
    projectList.should("have.length", 1);

    const dropdown = cy
      .get('[data-testid="hide-projects-list-button"]')
      .should("exist");
    dropdown.click();

    const project = cy.get('[data-testid="project_1"]').should("exist");
    project.should("have.length", 1);

    project.click();

    cy.location("pathname").should("include", "/projects/");
  });
});

describe("Plan List Page", () => {
  it("renders the page and Title", () => {
    cy.visit("localhost:7100/plans");

    const title = cy.get("h1").should("exist");
    title.should("include.text", "Plans");
  });

  it("renders the plan list", () => {
    cy.visit("localhost:7100/plans");

    const planList = cy.get('[data-testid="plan_list"]').should("exist");
    planList.should("have.length", 1);

    const dropdown = cy
      .get('[data-testid="hide-plans-list-button"]')
      .should("exist");
    dropdown.click();

    const plan = cy.get('[data-testid="plan_1"]').should("exist");
    plan.should("have.length", 1);
  });

  it("renders the plan details page on plan click", () => {
    cy.visit("localhost:7100/plans");

    const planList = cy.get('[data-testid="plan_list"]').should("exist");
    planList.should("have.length", 1);

    const dropdown = cy
      .get('[data-testid="hide-plans-list-button"]')
      .should("exist");
    dropdown.click();

    const plan = cy.get('[data-testid="plan_1"]').should("exist");
    plan.should("have.length", 1);

    plan.click();

    cy.location("pathname").should("include", "/plans/");
  });
});
