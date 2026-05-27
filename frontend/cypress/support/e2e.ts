import './commands';

Cypress.on('uncaught:exception', (err) => {
  // Ignore ResizeObserver errors (Material CDK side effect)
  if (err.message.includes('ResizeObserver')) return false;
  return true;
});
