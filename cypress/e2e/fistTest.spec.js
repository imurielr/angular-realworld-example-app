/// <reference types="cypress" />

describe('Test with backend', () => {

  beforeEach('login to the app', () => {
    cy.intercept({ method: 'GET', path: 'tags' }, { fixture: 'tags.json' })

    cy.loginToApplication();
  });

  it('verify correct request and response', () => {
    cy.intercept('POST', `${Cypress.env('apiUrl')}/api/articles`).as('postArticles');

    cy.contains('New Article').click();
    cy.get('[formcontrolname="title"]').type('This is a title');
    cy.get('[formcontrolname="description"]').type('This is a description');
    cy.get('[formcontrolname="body"]').type('This is a body of the article');
    cy.contains('Publish Article').click();

    cy.wait('@postArticles',);
    cy.get('@postArticles').then(xhr => {
      console.log(xhr);
      expect(xhr.response.statusCode).to.equal(200);
      expect(xhr.request.body.article.body).to.equal('This is a body of the article');
      expect(xhr.response.body.article.description).to.equal('This is a description');
    });
  });

  it('should have tags with routing object', () => {
    cy.get('.tag-list')
      .should('contain', 'cypress')
      .and('contain', 'automation')
      .and('contain', 'testing');
  });

  it('should verify global feed likes count', () => {
    cy.intercept('GET', '**/articles/feed*', '{"articles":[],"articlesCount":0}')
    cy.intercept('GET', '**/api/articles*', { fixture: 'articles.json' });

    cy.contains('Global Feed').click();
    cy.get('app-article-list button').then(listOfButtons => {
      expect(listOfButtons[0]).to.contain('10');
      expect(listOfButtons[1]).to.contain('200');
    });

    cy.fixture('articles').then(file => {
      const articleLink = file.articles[1].slug
      cy.intercept('POST', `**/articles/${articleLink}/favorite`, file);
    });

    cy.get('app-article-list button').eq(1).click().should('contain', '201');
  });

  it.skip('Intercepting and modifying the request and response', () => {
    // cy.intercept('POST', `${Cypress.env('apiUrl')}/api/articles`, (req) => {
    //   req.body.article.description = "This is a description 2"
    // }).as('postArticles');

    cy.intercept('POST', `${Cypress.env('apiUrl')}/api/articles`, (req) => {
      req.reply(res => {
        expect(res.body.article.description).to.equal('This is a description'); // Se valida el request original
        res.body.article.description = 'This is a description 2'; // Se cambia el valor que se envía al servidor
      })
    }).as('postArticles');

    cy.contains('New Article').click();
    cy.get('[formcontrolname="title"]').type('This is a title');
    cy.get('[formcontrolname="description"]').type('This is a description');
    cy.get('[formcontrolname="body"]').type('This is a body of the article');
    cy.contains('Publish Article').click();

    cy.wait('@postArticles',);
    cy.get('@postArticles').then(xhr => {
      console.log(xhr);
      expect(xhr.response.statusCode).to.equal(200);
      expect(xhr.request.body.article.body).to.equal('This is a body of the article');
      expect(xhr.response.body.article.description).to.equal('This is a description 2');
    });
  });

  it('delete a new article in a global feed', () => {
    const bodyRequest = {
      article: {
        tagList: [],
        title: "Request from API",
        description: "This is a request",
        body: "I created this with the API call"
      }
    }

    cy.intercept('DELETE', '**/articles/**').as('deleteArticle');

    cy.get('@token').then(token => {
        cy.request({
          url: `${Cypress.env('apiUrl')}/api/articles/`,
          headers: {
            'authorization': `Token ${token}`
          },
          method: 'POST',
          body: bodyRequest
        }).then(response => {
          expect(response.status).to.equal(200);
        });

        cy.contains('Global Feed').click();
        cy.get('.article-preview').first().click();
        cy.get('.article-actions').contains('Delete Article').click().as('deleteArticle');

        cy.wait('@deleteArticle');

        cy.request({
          url: `${Cypress.env('apiUrl')}/api/articles?limit=10&offset=0`,
          headers: {
            'authorization': `Token ${token}`
          },
          method: 'GET'
        }).its('body').then(body => {
          expect(body.articles[0].title).not.to.equal('Request from API');
        });

      });
  });

});