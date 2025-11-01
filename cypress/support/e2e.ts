/// <reference types="cypress" />
import { uuid } from "../../src/lib/crypto";

/**
 * IMPORTANT: These Cypress commands have been updated for Clerk authentication.
 *
 * The old username/password authentication has been replaced with Clerk.
 * E2E tests now need to use Clerk's testing utilities or mock authentication.
 *
 * See: https://clerk.com/docs/testing/cypress
 */

Cypress.Commands.add("getDataTest", (value: string) => {
	return cy.get(`[data-test=${value}]`);
});

Cypress.Commands.add("logout", () => {
	// Updated for Clerk: Visit logout page which clears Clerk session
	cy.visit("/logout");
	cy.url().should("include", "/sign-in");
});

Cypress.Commands.add("login", (username: string, password: string) => {
	// DEPRECATED: This command used the old /api/auth/login endpoint
	// TODO: Implement Clerk-based login using @clerk/testing
	// For now, this is a placeholder that should be replaced with proper Clerk test utilities
	cy.log("WARNING: login command needs to be updated for Clerk authentication");
	throw new Error(
		"login command is deprecated. Use Clerk testing utilities instead.",
	);
});

Cypress.Commands.add("addWebsite", (name: string, domain: string) => {
	// Note: Authorization header needs to be updated for Clerk JWT tokens
	cy.request({
		method: "POST",
		url: "/api/websites",
		headers: {
			"Content-Type": "application/json",
			// TODO: Use Clerk session token instead
		},
		body: {
			id: uuid(),
			name: name,
			domain: domain,
		},
	}).then((response) => {
		expect(response.status).to.eq(200);
	});
});

Cypress.Commands.add("deleteWebsite", (websiteId: string) => {
	cy.request({
		method: "DELETE",
		url: `/api/websites/${websiteId}`,
		headers: {
			"Content-Type": "application/json",
		},
	}).then((response) => {
		expect(response.status).to.eq(200);
	});
});

Cypress.Commands.add(
	"addUser",
	(email: string, clerkId: string, role: string) => {
		// Updated for Clerk: Use email and clerkId instead of username/password
		cy.request({
			method: "POST",
			url: "/api/users",
			headers: {
				"Content-Type": "application/json",
			},
			body: {
				email: email,
				clerkId: clerkId,
				role: role,
			},
		}).then((response) => {
			expect(response.status).to.eq(200);
		});
	},
);

Cypress.Commands.add("deleteUser", (userId: string) => {
	cy.request({
		method: "DELETE",
		url: `/api/users/${userId}`,
		headers: {
			"Content-Type": "application/json",
		},
	}).then((response) => {
		expect(response.status).to.eq(200);
	});
});

Cypress.Commands.add("addOrg", (name: string) => {
	cy.request({
		method: "POST",
		url: "/api/orgs",
		headers: {
			"Content-Type": "application/json",
		},
		body: {
			name: name,
		},
	}).then((response) => {
		expect(response.status).to.eq(200);
	});
});

Cypress.Commands.add("deleteOrg", (orgId: string) => {
	cy.request({
		method: "DELETE",
		url: `/api/orgs/${orgId}`,
		headers: {
			"Content-Type": "application/json",
		},
	}).then((response) => {
		expect(response.status).to.eq(200);
	});
});
