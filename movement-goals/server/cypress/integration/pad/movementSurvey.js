/**
 * Integration test for the movement survey.
 *
 * @author Tim Knops
 */

describe("Movement Survey", () => {

    beforeEach(() => {
        cy.viewport(1366, 768);
    })

    it("Login", () => {
        cy.visit("http://localhost:8080");

        cy.intercept("POST", "/users/login", {
            statusCode: 200,
            body: {username: "test"},
        }).as("login");

        cy.get("#exampleInputUsername").type("test");
        cy.get("#exampleInputPassword").type("test");

        cy.get(".login-form button").click();
        cy.wait("@login");
     });

    it("Valid intake starting screen", () => {
        cy.get("#nav-intake").click();

        cy.get(".next-btn").should("exist");
        cy.get(".prev-btn").should("exist");
        cy.get("#rowTitlesColumn").should("exist");

        cy.get("form").then((form) => {
            // Checks if the daysPerColumn exists, if so then check if the content of a single row is correct.
            if (form.find("#daysPerColumn").length > 0) {
                cy.get("#daysPerRow1").children("select").should("exist");
                cy.get("#daysPerRow1").children("p").should("exist").should("contain", "dagen");
            }

            // Checks if the timePerColumn exists, if so then check if the content of a single row is correct.
            if (form.find("#timePerColumn").length > 0) {
                cy.get("#timePerRow1").children("input").should("exist");
                cy.get("#timePerRow1").find("#hours").should("exist").should("contain", "uur");
                cy.get("#timePerRow1").find("#minutes").should("exist").should("contain", "min");
            }

            // Checks if the intensityColumn exists, if so then check if the content of a single row is correct.
            if (form.find("#intensityColumn").length > 0) {
                cy.get("#intensityRow1").should("exist").children("select").should("exist");
            }
        });
    });

    it("Proper Validation Message", () => {
        cy.get(".next-btn").click();
        cy.get(".alert").should("exist").should("contain",
            "Als u voor deze activiteit geen tijd heeft besteed, vink a.u.b 'Niet van toepassing' aan");
        cy.get("#checkbox").should("have.css", "border-color", "rgb(220, 53, 69)").click();

        // If enabled posts into db.
        // cy.get(".next-btn").click();
        // cy.get(".alert").should("not.exist");
    });
});