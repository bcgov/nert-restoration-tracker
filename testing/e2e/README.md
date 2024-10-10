# Demo of End-to-End testing using [Cypress.io](https://www.cypress.io/)

## Setup of KeyCloak

Using a `non-prod` KeyCloak Realm, follow instructions as per this [article](https://developers.redhat.com/blog/2020/01/29/api-login-and-jwt-token-generation-using-keycloak/) to set up a specific KeyCloak Client using:

- `Direct Grant` Flow and
- `Client Id and Secret` Credentials

Alternatively, you may import the sample [KeyCloak Client](./sample.kc-client.json) and customize for your application.

Note the Client ID and Client Secret (under the `Credentials` tab), as you'll need both for the next step,

## Application Setup

Customize the credentials for your application.
[`creatorUser`, `maintainerUser`, `adminUser`] Users were created within the Dev environment of Basic BCeIDs.

- copy [sample.cypress.env.json](./sample.cypress.env.json) to `cypress.env.json`
- edit `cypress.env.json`, setting the variable values, including [`creatorUser`, `maintainerUser`, `adminUser`] and `password` from github secrets

### baseURL
- configure the `baseURL` for your application in the [config file](./cypress/plugins/index.js#L21)
    - NOTE: Uncomment line in [commands](./cypress/support/commands.ts#L28), To hydrate `baseURL` from config

### CLI Run
```bash
npm run test:e2e
```

### APP UI
```bash
npm run cypress
```