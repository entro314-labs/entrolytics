describe('Org API tests', () => {
  Cypress.session.clearAllSavedSessions()

  let orgId
  let userId

  before(() => {
    cy.login(Cypress.env('entrolytics_user'), Cypress.env('entrolytics_password'))
    cy.fixture('users').then((data) => {
      const userCreate = data.userCreate
      cy.request({
        method: 'POST',
        url: '/api/users',
        headers: {
          'Content-Type': 'application/json',
          Authorization: Cypress.env('authorization'),
        },
        body: userCreate,
      }).then((response) => {
        userId = response.body.id
        expect(response.status).to.eq(200)
        expect(response.body).to.have.property('username', 'cypress1')
        expect(response.body).to.have.property('role', 'user')
      })
    })
  })

  it('Creates a org.', () => {
    cy.fixture('orgs').then((data) => {
      const orgCreate = data.orgCreate
      cy.request({
        method: 'POST',
        url: '/api/orgs',
        headers: {
          'Content-Type': 'application/json',
          Authorization: Cypress.env('authorization'),
        },
        body: orgCreate,
      }).then((response) => {
        orgId = response.body[0].id
        expect(response.status).to.eq(200)
        expect(response.body[0]).to.have.property('name', 'cypress')
        expect(response.body[1]).to.have.property('role', 'org-owner')
      })
    })
  })

  it('Gets a orgs by ID.', () => {
    cy.request({
      method: 'GET',
      url: `/api/orgs/${orgId}`,
      headers: {
        'Content-Type': 'application/json',
        Authorization: Cypress.env('authorization'),
      },
    }).then((response) => {
      expect(response.status).to.eq(200)
      expect(response.body).to.have.property('id', orgId)
    })
  })

  it('Updates a org.', () => {
    cy.fixture('orgs').then((data) => {
      const orgUpdate = data.orgUpdate
      cy.request({
        method: 'POST',
        url: `/api/orgs/${orgId}`,
        headers: {
          'Content-Type': 'application/json',
          Authorization: Cypress.env('authorization'),
        },
        body: orgUpdate,
      }).then((response) => {
        expect(response.status).to.eq(200)
        expect(response.body).to.have.property('id', orgId)
        expect(response.body).to.have.property('name', 'cypressUpdate')
      })
    })
  })

  it('Get all users that belong to a org.', () => {
    cy.request({
      method: 'GET',
      url: `/api/orgs/${orgId}/users`,
      headers: {
        'Content-Type': 'application/json',
        Authorization: Cypress.env('authorization'),
      },
    }).then((response) => {
      expect(response.status).to.eq(200)
      expect(response.body.data[0]).to.have.property('id')
      expect(response.body.data[0]).to.have.property('orgId')
      expect(response.body.data[0]).to.have.property('userId')
      expect(response.body.data[0]).to.have.property('user')
    })
  })

  it('Get a user belonging to a org.', () => {
    cy.request({
      method: 'GET',
      url: `/api/orgs/${orgId}/users/${Cypress.env('entrolytics_user_id')}`,
      headers: {
        'Content-Type': 'application/json',
        Authorization: Cypress.env('authorization'),
      },
    }).then((response) => {
      expect(response.status).to.eq(200)
      expect(response.body).to.have.property('orgId')
      expect(response.body).to.have.property('userId')
      expect(response.body).to.have.property('role')
    })
  })

  it('Get all websites belonging to a org.', () => {
    cy.request({
      method: 'GET',
      url: `/api/orgs/${orgId}/websites`,
      headers: {
        'Content-Type': 'application/json',
        Authorization: Cypress.env('authorization'),
      },
    }).then((response) => {
      expect(response.status).to.eq(200)
      expect(response.body).to.have.property('data')
    })
  })

  it('Add a user to a org.', () => {
    cy.request({
      method: 'POST',
      url: `/api/orgs/${orgId}/users`,
      headers: {
        'Content-Type': 'application/json',
        Authorization: Cypress.env('authorization'),
      },
      body: {
        userId,
        role: 'org-member',
      },
    }).then((response) => {
      expect(response.status).to.eq(200)
      expect(response.body).to.have.property('userId', userId)
      expect(response.body).to.have.property('role', 'org-member')
    })
  })

  it(`Update a user's role on a org.`, () => {
    cy.request({
      method: 'POST',
      url: `/api/orgs/${orgId}/users/${userId}`,
      headers: {
        'Content-Type': 'application/json',
        Authorization: Cypress.env('authorization'),
      },
      body: {
        role: 'org-view-only',
      },
    }).then((response) => {
      expect(response.status).to.eq(200)
      expect(response.body).to.have.property('userId', userId)
      expect(response.body).to.have.property('role', 'org-view-only')
    })
  })

  it(`Remove a user from a org.`, () => {
    cy.request({
      method: 'DELETE',
      url: `/api/orgs/${orgId}/users/${userId}`,
      headers: {
        'Content-Type': 'application/json',
        Authorization: Cypress.env('authorization'),
      },
    }).then((response) => {
      expect(response.status).to.eq(200)
    })
  })

  it('Deletes a org.', () => {
    cy.request({
      method: 'DELETE',
      url: `/api/orgs/${orgId}`,
      headers: {
        'Content-Type': 'application/json',
        Authorization: Cypress.env('authorization'),
      },
    }).then((response) => {
      expect(response.status).to.eq(200)
      expect(response.body).to.have.property('ok', true)
    })
  })

  // it('Gets all orgs that belong to a user.', () => {
  //   cy.request({
  //     method: 'GET',
  //     url: `/api/users/${userId}/orgs`,
  //     headers: {
  //       'Content-Type': 'application/json',
  //       Authorization: Cypress.env('authorization'),
  //     },
  //   }).then(response => {
  //     expect(response.status).to.eq(200);
  //     expect(response.body).to.have.property('data');
  //   });
  // });

  after(() => {
    cy.deleteUser(userId)
  })
})
