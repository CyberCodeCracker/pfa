/**
 * Workflow d'invitation étudiant.
 *
 * Prérequis: un stage existant créé par un enseignant seeded.
 * Ces tests nécessitent que Docker soit démarré et la DB seedée.
 */
describe("Workflow d'invitation étudiant", () => {
  const stageId = 1; // Mis à jour après seed

  it("l'enseignant peut ajouter un étudiant via l'onglet Étudiants", () => {
    cy.loginAs('mohamed.benali@enseignant.pfa.tn', 'Password123!');
    cy.visit(`/stages/${stageId}`);

    // Aller sur l'onglet Étudiants
    cy.contains('mat-tab-header .mat-tab-label, .mat-tab-label', 'Étudiants', { timeout: 8000 }).click();

    cy.contains('Ajouter un étudiant').click();

    cy.get('input[placeholder*="Prénom"]').type('Sophie');
    cy.get('input[placeholder*="Nom"]').type('Lefebvre');
    cy.get('input[placeholder*="Email"]').type(`etudiant.cypress.${Date.now()}@test.tn`);

    cy.get('button').contains('Inviter').click();

    cy.contains(/invité|ajouté/i, { timeout: 8000 }).should('be.visible');
  });

  it("la page d'invitation avec token invalide affiche une erreur", () => {
    cy.visit('/accepter-invitation/token-invalide-12345');
    cy.contains(/invalide|expiré|introuvable/i, { timeout: 8000 }).should('be.visible');
  });
});
