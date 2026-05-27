describe('Gestion des stages (enseignant)', () => {
  beforeEach(() => {
    cy.loginAs('mohamed.benali@enseignant.pfa.tn', 'Password123!');
    cy.visit('/stages');
  });

  it('affiche la liste des stages', () => {
    cy.contains('Mes stages', { timeout: 8000 }).should('be.visible');
  });

  it('crée un nouveau stage', () => {
    const titre = `Stage Test Cypress ${Date.now()}`;

    cy.contains('Nouveau stage').click();
    cy.url().should('include', '/stages/nouveau');

    cy.get('input[formControlName="titre"]').type(titre);
    cy.get('textarea[formControlName="description"]').type('Description e2e Cypress');
    cy.get('input[formControlName="date_debut"]').type('2026-09-01');
    cy.get('input[formControlName="date_fin"]').type('2027-01-31');

    // Sélectionner un établissement
    cy.get('mat-select[formControlName="etablissement_id"]').click();
    cy.get('mat-option').first().click();

    cy.get('button[type="submit"]').click();

    // Doit rediriger vers le détail du stage
    cy.url({ timeout: 10000 }).should('match', /\/stages\/\d+/);
    cy.contains(titre, { timeout: 8000 }).should('be.visible');
  });

  it('filtre les stages par titre', () => {
    cy.get('input[placeholder*="Rechercher"]').type('Test');
    cy.get('.stage-card, mat-card').each(($el) => {
      cy.wrap($el).invoke('text').should('match', /test/i);
    });
  });
});

describe('Accès refusé (étudiant)', () => {
  it('un étudiant ne peut pas accéder à /stages/nouveau', () => {
    // Students don't have teacher accounts seeded by default in e2e
    // This test verifies the route guard redirects properly
    cy.clearCookies();
    cy.visit('/stages/nouveau');
    cy.url({ timeout: 6000 }).should('include', '/login');
  });
});
