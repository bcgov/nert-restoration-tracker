// ***********************************************
// This example commands.js shows you how to
// create various custom commands and overwrite
// existing commands.
//
// For more comprehensive examples of custom
// commands please read more here:
// https://on.cypress.io/custom-commands
// ***********************************************

import "cypress-file-upload";
import "cypress-keycloak-commands";
import "cypress-localstorage-commands";
import "./keycloak.js";

Cypress.Commands.overwrite("login", (originalFn: any) => {
  originalFn({
    root: Cypress.env("authUrl"),
    realm: Cypress.env("authRealm"),
    username: Cypress.env("username"),
    password: Cypress.env("password"),
    client_id: Cypress.env("authClientId"),
    redirect_uri: Cypress.env("host")
  });
});

Cypress.Commands.overwrite("logout", (originalFn: any) => {
  originalFn({
    root: Cypress.env("authUrl"),
    realm: Cypress.env("authRealm"),
    redirect_uri: Cypress.env("host")
  });
});
