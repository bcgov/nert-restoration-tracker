declare namespace Cypress {
  interface Chainable {
    login(): Chainable<Response<any>>;

    logout(): Chainable<Response<any>>;

    /**
     * Custom command to perform stubAuth
     *
     */
    stubToken(): Chainable<Response<any>>;

    /**
     * Custom command to perform stubUserInfo
     *
     */
    stubUserInfo(): Chainable<Response<any>>;

    /**
     * Custom command to perform stubSelf
     *
     */
    stubSelf(): Chainable<Response<any>>;

    /**
     * Custom command to perform stubAuth
     *
     */
    stubAuth(): Chainable<Response<any>>;
  }
}
