describe('Authentification', () => {
  beforeEach(() => {
    cy.visit('/login');
  });

  it('affiche la page de connexion en français', () => {
    cy.contains('Connexion').should('be.visible');
    cy.get('input[type="email"]').should('exist');
    cy.get('input[type="password"]').should('exist');
  });

  it('affiche une erreur pour identifiants invalides', () => {
    cy.get('input[type="email"]').type('wrong@example.com');
    cy.get('input[type="password"]').type('WrongPassword123!');
    cy.get('button[type="submit"]').click();
    cy.contains(/identifiants|invalide|incorrect/i, { timeout: 8000 }).should('be.visible');
  });

  it('connecte un enseignant avec les bons identifiants', () => {
    cy.get('input[type="email"]').type('mohamed.benali@enseignant.pfa.tn');
    cy.get('input[type="password"]').type('Password123!');
    cy.get('button[type="submit"]').click();
    cy.url({ timeout: 10000 }).should('include', '/dashboard');
    cy.contains('ScholarFlow').should('be.visible');
  });

  it('déconnecte et redirige vers /login', () => {
    cy.loginAs('mohamed.benali@enseignant.pfa.tn', 'Password123!');
    cy.visit('/dashboard');
    cy.contains('Déconnexion').click();
    cy.url({ timeout: 6000 }).should('include', '/login');
  });

  it('redirige /dashboard vers /login sans session', () => {
    cy.clearCookies();
    cy.visit('/dashboard');
    cy.url({ timeout: 6000 }).should('include', '/login');
  });
});
