describe('dotnet', () => {

  beforeEach(() => {
    cy.visit('http://localhost:7779?testing=true');
  });

  it('should display welcome message', () => {
    // Custom command example, see `../support/commands.ts` file
    cy.login('my-email@something.com', 'myPassword');
    // eslint-disable-next-line cypress/no-unnecessary-waiting
    cy.wait(10000);
    // Function helper example, see `../support/app.po.ts` file
    cy.contains('Info: You will need to be logged in to do anything interesting!');
  });
});