describe('cicd', () => {

  beforeEach(() => {
    cy.visit('http://localhost:7776');
  });
  
  it('should display welcome message', () => {
    // Custom command example, see `../support/commands.ts` file
    cy.login('my-email@something.com', 'myPassword');
    // Function helper example, see `../support/app.po.ts` file
    cy.contains('Angular Studio:');
  });
});
