/**
 * Controller for account entity
 * @author Sara Benali
 */

import { Controller } from "./controller.js";
import { accountRepository } from "../repositories/accountRepository.js"
import { UsersRepository } from "../repositories/usersRepository.js";
import { App } from "../app.js";

export class AccountController extends Controller {
    #accountView;
    #accountRepository;
    #usersRepository;

    /**
     * constructor
     * @author Sara Benali
     */
    constructor() {
        super();
        this.#accountRepository = new accountRepository();
        this.#usersRepository = new UsersRepository();

        this.#setupView();
    }

    /**
     * Method to load html view and event listener to make button work
     * @async allows program to run a function without freezing the program
     * @return {Promise<void>}
     * @author Sara Benali
     */
    async #setupView() {
        this.#accountView = await super.loadHtmlIntoContent("html_views/account.html");
        this.#accountView.querySelector(".btn").addEventListener("click", (event) => this.#saveAccount(event));

        this.#handleLoginHyperlink();
    }

    /**
     * Validation for user input
     * @param event preventing page from submitting something before user enters information
     * @return {Promise<void>}
     * @author Sara Benali
     * */

    async #saveAccount(event) {
        event.preventDefault();

        const firstName = this.#accountView.querySelector("#inputFirstName").value;
        const lastName = this.#accountView.querySelector("#inputLastName").value;
        const username = this.#accountView.querySelector("#inputUserName").value;
        const email = this.#accountView.querySelector("#inputEmail").value;
        const password = this.#accountView.querySelector("#inputPassword").value;
        const warningBox = this.#accountView.querySelector(".error");
        const form = this.#accountView.querySelector(".needs-validation");

        if (firstName.length === 0) {
            warningBox.innerHTML = "Voer een voornaam in!";
            form.classList.add('was-validated');
            return;
        }

        if (lastName.length === 0) {
            warningBox.innerHTML = "Voer een achternaam in!";
            form.classList.add('was-validated');
            return;
        }

        if (username.length === 0) {
            warningBox.innerHTML = "Voer een gebruikersnaam in!";
            form.classList.add('was-validated');
            return;
        }

        if (email.length === 0) {
            warningBox.innerHTML = "Voer een email in!";
            form.classList.add('was-validated');
            return;
        }

        if (password.length === 0) {
            warningBox.innerHTML = "Voer een wachtwoord in!";
            form.classList.add('was-validated');
            return;
        }

        try {
            await this.#accountRepository.account(firstName, lastName, username, email, password);

            await this.#addSurveyRelation(username);

            App.loadController(App.CONTROLLER_LOGIN);
        } catch (e) {
            warningBox.innerHTML = "Er is iets fout gegaan";
        }
    }

    /**
     * Adding the relation between the user and survey after account creation.
     *
     * @param username  the username of the user
     * @author Tim Knops
     */
    async #addSurveyRelation(username) {
        const userId = await this.#usersRepository.getUserId(username);
        await this.#accountRepository.addSurveyRelation(userId[0].user_id, 1, 0);
    }

    /**
     * Loads the login controller when the 'already have an account' link is pressed.
     *
     * @author Tim Knops
     */
    async #handleLoginHyperlink() {
        const link = await this.#accountView.querySelector("a");

        link.addEventListener("click", () => {
           App.loadController(App.CONTROLLER_LOGIN);
        });
    }
}
