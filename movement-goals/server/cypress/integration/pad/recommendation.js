//Context: Recommendation
describe("Recommendation",  () => {
    const endpoint = "/recommendations/save";

    //Run before each test in this context
    beforeEach(() => {
        //Go to the specified URL
        cy.visit("http://localhost:8080");
    });

    //Test: Validate login form
    it("Valid recommendations page", () => {
        //Start a fake server
        cy.server();

        const mockedResponse = {"username": "test"};

        //Add a stub with the URL /users/login as a POST
        //Respond with a JSON-object when requested
        //Give the stub the alias: @login
        cy.intercept('POST', '/users/login', {
            statusCode: 200,
            body: mockedResponse,
        }).as('login');

        //Find the field for the username and type the text "test".
        cy.get("#exampleInputUsername").type("test");

        //Find the field for the password and type the text "test".
        cy.get("#exampleInputPassword").type("test");

        //Find the button to login and click it
        console.log(cy.get(".login-form button"));
        cy.get(".login-form button").click();

        //Wait for the @login-stub to be called by the click-event.
        cy.wait("@login");

        //The @login-stub is called, check the contents of the incoming request.
        cy.get("@login").should((xhr) => {
            //The username should match what we typed earlier
            const body = xhr.request.body;
            expect(body.username).equals("test");

            //The password should match what we typed earlier
            expect(body.password).equals("test");
        });

        //After a successful login, the URL should now contain #welcome.
        cy.url().should("contain", "#welcome");

        cy.get("#recommendation").click()
        cy.url().should("contain", "#recommendation")
    });

    //Test: Successful login
    it("Successful save recommendation",  () => {
        //Start a fake server
        cy.server();

        const mockedResponse = {"username": "test"};

        const mockedResponseRecommendation = {"user_id": 1, "muscle": 1,"cardio":1,"balance":0};

        //Add a stub with the URL /users/login as a POST
        //Respond with a JSON-object when requested
        //Give the stub the alias: @login
        cy.intercept('POST', '/users/login', {
            statusCode: 200,
            body: mockedResponse,
        }).as('login');

        cy.intercept('POST', '/recommendations/check', {
            statusCode: 200,
            body: null,
        }).as('check')

        cy.intercept('POST', '/recommendations/update', {
            statusCode: 200,
            body: mockedResponseRecommendation,
        }).as('recommendations')

        //Find the field for the username and type the text "test".
        cy.get("#exampleInputUsername").type("test");

        //Find the field for the password and type the text "test".
        cy.get("#exampleInputPassword").type("test");

        //Find the button to login and click it
        console.log(cy.get(".login-form button"));
        cy.get(".login-form button").click();

        //Wait for the @login-stub to be called by the click-event.
        cy.wait("@login");

        //The @login-stub is called, check the contents of the incoming request.
        cy.get("@login").should((xhr) => {
            //The username should match what we typed earlier
            const body = xhr.request.body;
            expect(body.username).equals("test");

            //The password should match what we typed earlier
            expect(body.password).equals("test");
        });

        //After a successful login, the URL should now contain #welcome.
        cy.url().should("contain", "#welcome");

        cy.get("#recommendation").click();
        cy.get("#checkMuscle").click();
        cy.get("#checkBone").click();

        console.log(cy.get(".btn"));
        cy.get(".btn").click();

        cy.wait("@recommendations");

        cy.get("@recommendations").should((xhr) => {
            //The items should match what we typed earlier
            const body = xhr.request.body;

            expect(body.muscle).equals(1);
            expect(body.cardio).equals(1);
            expect(body.balance).equals(0);
        });
    });

    //Test: Failed login
    it("Failed save",  () => {
        //Start a fake server
        cy.server();

        const mockedResponse = {"username": "test"};

        const mockedResponseRecommendation = {
            reason: "ERROR"
        };

        //Add a stub with the URL /users/login as a POST
        //Respond with a JSON-object when requested
        //Give the stub the alias: @login
        cy.intercept('POST', '/users/login', {
            statusCode: 200,
            body: mockedResponse,
        }).as('login');

        cy.intercept('POST', '/recommendations/check', {
            statusCode: 200,
            body: null,
        }).as('check')

        cy.intercept('POST', '/recommendations/update', {
            statusCode: 401,
            body: mockedResponseRecommendation,
        }).as('recommendations')

        //Find the field for the username and type the text "test".
        cy.get("#exampleInputUsername").type("test");

        //Find the field for the password and type the text "test".
        cy.get("#exampleInputPassword").type("test");

        //Find the button to login and click it
        console.log(cy.get(".login-form button"));
        cy.get(".login-form button").click();

        //Wait for the @login-stub to be called by the click-event.
        cy.wait("@login");

        //The @login-stub is called, check the contents of the incoming request.
        cy.get("@login").should((xhr) => {
            //The username should match what we typed earlier
            const body = xhr.request.body;
            expect(body.username).equals("test");

            //The password should match what we typed earlier
            expect(body.password).equals("test");
        });

        //After a successful login, the URL should now contain #welcome.
        cy.url().should("contain", "#welcome");

        // Go to the recommendation page and select 2 things, if it doesnt work then stop
        cy.get("#recommendation").click();
        cy.get("#checkMuscle").click();
        cy.get("#checkBone").click();

        console.log(cy.get(".btn"));
        cy.get(".btn").click();

        cy.wait("@recommendations");
    });
});