describe("Keycloak Login", () => {
  beforeEach(() => {
    cy.kcFakeLogin("user", "");
    
  });

  it("should call an API with the token", () => {
    
  });
});
