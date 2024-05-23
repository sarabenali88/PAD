import { App } from "../app.js";
import { Controller } from "./controller.js";

export class HomeController extends Controller {
    #homeView;

    constructor() {
        super();

        this.#setupView();
    }

    async #setupView() {
        this.#homeView = await super.loadHtmlIntoContent("html_views/home.html")

        this.#handleLoginRegisterButtons();
    }

    #handleLoginRegisterButtons() {
        const loginButtons = this.#homeView.querySelectorAll(".login-btn");
        const registerButtons = this.#homeView.querySelectorAll(".register-btn");

        loginButtons.forEach((button) => {
            button.addEventListener("click", () => {
               App.loadController(App.CONTROLLER_LOGIN);
            });
        });

        registerButtons.forEach((button) => {
           button.addEventListener("click", () => {
              App.loadController(App.CONTROLLER_ACCOUNT);
           });
        });
    }
}