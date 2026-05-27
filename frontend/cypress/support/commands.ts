declare global {
  namespace Cypress {
    interface Chainable {
      loginAs(email: string, password: string): Chainable<void>;
      csrfCookie(): Chainable<void>;
    }
  }
}

Cypress.Commands.add('csrfCookie', () => {
  cy.request({ url: 'http://localhost/sanctum/csrf-cookie', method: 'GET' });
});

Cypress.Commands.add('loginAs', (email: string, password: string) => {
  cy.csrfCookie();
  cy.getCookie('XSRF-TOKEN').then((cookie) => {
    const token = cookie ? decodeURIComponent(cookie.value) : '';
    cy.request({
      method: 'POST',
      url: 'http://localhost/api/login',
      body: { email, password },
      headers: { 'X-XSRF-TOKEN': token, 'Accept': 'application/json', 'Content-Type': 'application/json' },
    });
  });
});

export {};
