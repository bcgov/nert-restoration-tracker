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
