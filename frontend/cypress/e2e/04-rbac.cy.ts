/**
 * Tests RBAC: vérification que les restrictions de rôles sont respectées.
 */
describe('RBAC — Contrôle des accès', () => {
  it('un utilisateur non connecté est redirigé vers /login sur toute route protégée', () => {
    cy.clearCookies();
    const protectedRoutes = ['/dashboard', '/stages', '/etudiants', '/reunions', '/messagerie', '/notifications'];

    protectedRoutes.forEach((route) => {
      cy.visit(route);
      cy.url({ timeout: 6000 }).should('include', '/login');
    });
  });

  it('un enseignant connecté accède au tableau de bord enseignant', () => {
    cy.loginAs('mohamed.benali@enseignant.pfa.tn', 'Password123!');
    cy.visit('/dashboard');
    cy.url({ timeout: 8000 }).should('include', '/dashboard');
    cy.get('mat-sidenav').contains('Étudiants').should('be.visible');
  });

  it("un enseignant n'est pas redirigé vers /mes-stages (route étudiant)", () => {
    cy.loginAs('mohamed.benali@enseignant.pfa.tn', 'Password123!');
    cy.visit('/mes-stages');
    // RoleGuard redirige vers /dashboard pour un enseignant
    cy.url({ timeout: 6000 }).should('include', '/dashboard');
  });
});
