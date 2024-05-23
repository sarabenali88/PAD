/**
 * Integration test for the activites
 *
 * @author Tim Knops
 */

describe ("Movement Activities", () => {

    beforeEach (() => {
        cy.viewport(1366, 768);
    });

    it ("Login", () => {
        cy.visit("http://localhost:8080");

        cy.intercept("POST", "/users/login", {
            statusCode: 200,
            body: {username: "test"},
        }).as("login");

        cy.get("#login-nav-btn").click();
        cy.get("#exampleInputUsername").type("test");
        cy.get("#exampleInputPassword").type("test");

        cy.get(".login-form button").click();
        cy.wait("@login");
    });

    it ("Valid activities starting screen", () => {
        cy.get("#activities-nav-btn").click();

        const mockedResponse = `[{"activity_name":"Wandelen","bone":{"type":"Buffer","data":[1]},"muscle":{"type":"Buffer","data":[0]},"balance":{"type":"Buffer","data":[0]}}]`

        cy.intercept("GET", "/activities/1/2/2", {
            statusCode: 200,
            body: mockedResponse
        }).as("getActivities");

        cy.wait("@getActivities");

        cy.get("#Wandelen > .m-0").should("exist").should("contain", "Wandelen");
        cy.get(".icons-container > .fa-bone").should("exist");
    });

    it ("Validation", () => {
        cy.get(".activities-alert").should("not.be.visible");
        cy.get(".button-div > .btn").click();
        cy.get(".activities-alert").should("be.visible");

        cy.get("#Wandelen").click();
        cy.get(".activities-alert").should("not.be.visible");
        cy.get("#Wandelen").should("have.class", "chosen-activity");
    });

    it ("Modal", () => {
        cy.get(".modal").should("not.have.class", "show");

        cy.get(".button-div > .btn").click();
        cy.get(".modal").should("have.class", "show");

        cy.get(".modal-body").should("contain", "Wandelen");
    });
});