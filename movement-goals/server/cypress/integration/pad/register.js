//Context: register
describe("Register",  ()=> {
    const apiEndpoint = "/myfitnessgo/account";

    beforeEach(() =>{
        cy.visit("http://localhost:3000/#account");

    });
    /**
     *
     */
    //Validate register form
    it("Valid registration form", () => {

        //Find the field for the first name
        cy.get("#inputFirstName").should("exist");

        //Find the field for the last name
        cy.get("#inputLastName").should("exist");

        //Find the field for the username
        cy.get("#inputUserName").should("exist");

        //Find the field for the email
        cy.get("#inputEmail").should("exist");

        //Find the field for the password
        cy.get("#inputPassword").should("exist");

        //Find the button to submit
        cy.get(".btn").should("exist");
        });

    it('Succesful created account ',  ()=> {
        cy.server();

        const mockedResponse = {"firstname": "testgebruiker"};

        cy.intercept('POST', '/myfitnessgo/account',{
            statusCode: 200,
            body: mockedResponse
        }).as('registration');

        cy.get("#inputFirstName").type("testgebruiker");
        cy.get("#inputLastName").type("tester");
        cy.get("#inputUserName").type("tester1");
        cy.get("#inputEmail").type("test@gmail.com");
        cy.get("#inputPassword").type("test123");

        console.log(cy.get(".btn"));
        cy.get(".btn").click();


        cy.wait("@registration");

        cy.get("@registration").should((xhr) => {
          const body = xhr.request.body;
          expect(body.firstName).equals("testgebruiker");
          expect(body.lastName).equals("tester");
          expect(body.username).equals("tester1");
          expect(body.email).equals("test@gmail.com");
          expect(body.password).equals("test123");

        });
        cy.url().should("contain", "#account");
    });

    it('Failed creating account ',  () => {
        cy.server();

        const mockedResponse = {
            reason: "Error"
        };

        cy.intercept('POST', '/myfitnessgo/account' , {
            statusCode: 401,
            body: mockedResponse
        }).as('registration');

        cy.get("#inputFirstName").type("testgebruiker");
        cy.get("#inputLastName").type("tester");
        cy.get("#inputUserName").type("tester1");
        cy.get("#inputEmail").type("testgmail.com");
        cy.get("#inputPassword").type("test123");

        console.log(cy.get(".btn"));
        cy.get(".btn").click();
        cy.wait("@registration");

        cy.get(".error").should("exist").should("contain", "Er is iets fout gegaan");

    });


});