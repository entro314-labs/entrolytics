import { uuid } from "../../src/lib/crypto";

describe("Website API tests", () => {
	Cypress.session.clearAllSavedSessions();

	let websiteId;
	let orgId;

	before(() => {
		cy.login(
			Cypress.env("entrolytics_user"),
			Cypress.env("entrolytics_password"),
		);
		cy.fixture("orgs").then((data) => {
			const orgCreate = data.orgCreate;
			cy.request({
				method: "POST",
				url: "/api/orgs",
				headers: {
					"Content-Type": "application/json",
					Authorization: Cypress.env("authorization"),
				},
				body: orgCreate,
			}).then((response) => {
				orgId = response.body[0].id;
				expect(response.status).to.eq(200);
				expect(response.body[0]).to.have.property("name", "cypress");
				expect(response.body[1]).to.have.property("role", "org-owner");
			});
		});
	});

	it("Creates a website for user.", () => {
		cy.fixture("websites").then((data) => {
			const websiteCreate = data.websiteCreate;
			cy.request({
				method: "POST",
				url: "/api/websites",
				headers: {
					"Content-Type": "application/json",
					Authorization: Cypress.env("authorization"),
				},
				body: websiteCreate,
			}).then((response) => {
				websiteId = response.body.id;
				expect(response.status).to.eq(200);
				expect(response.body).to.have.property("name", "Cypress Website");
				expect(response.body).to.have.property("domain", "cypress.com");
			});
		});
	});

	it("Creates a website for org.", () => {
		cy.request({
			method: "POST",
			url: "/api/websites",
			headers: {
				"Content-Type": "application/json",
				Authorization: Cypress.env("authorization"),
			},
			body: {
				name: "Org Website",
				domain: "orgwebsite.com",
				orgId: orgId,
			},
		}).then((response) => {
			expect(response.status).to.eq(200);
			expect(response.body).to.have.property("name", "Org Website");
			expect(response.body).to.have.property("domain", "orgwebsite.com");
		});
	});

	it("Creates a website with a fixed ID.", () => {
		cy.fixture("websites").then((data) => {
			const websiteCreate = data.websiteCreate;
			const fixedId = uuid();
			cy.request({
				method: "POST",
				url: "/api/websites",
				headers: {
					"Content-Type": "application/json",
					Authorization: Cypress.env("authorization"),
				},
				body: { ...websiteCreate, id: fixedId },
			}).then((response) => {
				expect(response.status).to.eq(200);
				expect(response.body).to.have.property("id", fixedId);
				expect(response.body).to.have.property("name", "Cypress Website");
				expect(response.body).to.have.property("domain", "cypress.com");

				// cleanup
				cy.request({
					method: "DELETE",
					url: `/api/websites/${fixedId}`,
					headers: {
						"Content-Type": "application/json",
						Authorization: Cypress.env("authorization"),
					},
				});
			});
		});
	});

	it("Returns all tracked websites.", () => {
		cy.request({
			method: "GET",
			url: "/api/websites",
			headers: {
				"Content-Type": "application/json",
				Authorization: Cypress.env("authorization"),
			},
		}).then((response) => {
			expect(response.status).to.eq(200);
			expect(response.body.data[0]).to.have.property("id");
			expect(response.body.data[0]).to.have.property("name");
			expect(response.body.data[0]).to.have.property("domain");
		});
	});

	it("Gets a website by ID.", () => {
		cy.request({
			method: "GET",
			url: `/api/websites/${websiteId}`,
			headers: {
				"Content-Type": "application/json",
				Authorization: Cypress.env("authorization"),
			},
		}).then((response) => {
			expect(response.status).to.eq(200);
			expect(response.body).to.have.property("name", "Cypress Website");
			expect(response.body).to.have.property("domain", "cypress.com");
		});
	});

	it("Updates a website.", () => {
		cy.fixture("websites").then((data) => {
			const websiteUpdate = data.websiteUpdate;
			cy.request({
				method: "POST",
				url: `/api/websites/${websiteId}`,
				headers: {
					"Content-Type": "application/json",
					Authorization: Cypress.env("authorization"),
				},
				body: websiteUpdate,
			}).then((response) => {
				websiteId = response.body.id;
				expect(response.status).to.eq(200);
				expect(response.body).to.have.property(
					"name",
					"Cypress Website Updated",
				);
				expect(response.body).to.have.property("domain", "cypressupdated.com");
			});
		});
	});

	it("Resets a website by removing all data related to the website.", () => {
		cy.request({
			method: "POST",
			url: `/api/websites/${websiteId}/reset`,
			headers: {
				"Content-Type": "application/json",
				Authorization: Cypress.env("authorization"),
			},
		}).then((response) => {
			expect(response.status).to.eq(200);
			expect(response.body).to.have.property("ok", true);
		});
	});

	it("Deletes a website.", () => {
		cy.request({
			method: "DELETE",
			url: `/api/websites/${websiteId}`,
			headers: {
				"Content-Type": "application/json",
				Authorization: Cypress.env("authorization"),
			},
		}).then((response) => {
			expect(response.status).to.eq(200);
			expect(response.body).to.have.property("ok", true);
		});
	});

	after(() => {
		cy.deleteOrg(orgId);
	});
});
