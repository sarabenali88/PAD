/**
 * Responsible for handling the actions happening on the navigation
 *
 * @author Lennard Fonteijn & Pim Meijer
 */

import { App } from "../app.js";
import {Controller} from "./controller.js";

export class NavbarController extends Controller{
    #navbarView

    constructor() {
        super();
        this.#setupView();
    }

    /**
     * Loads contents of desired HTML file into the index.html .navigation div
     * @returns {Promise<void>}
     * @private
     */
    async #setupView() {
        //await for when HTML is
        let navbarViewName;
        App.isLoggedIn(() => navbarViewName = "navbar_logged_in", () => navbarViewName = "navbar_logged_out");

        this.#navbarView = await super.loadHtmlIntoNavigation(`html_views/${navbarViewName}.html`)

        //from here we can safely get elements from the view via the right getter
        const anchors = this.#navbarView.querySelectorAll("a.nav-link");

        //set click listener on each anchor
        anchors.forEach(anchor => anchor.addEventListener("click", (event) => this.#handleClickNavigationItem(event)))
    }

    /**
     * Reads data attribute on each .nav-link and then when clicked navigates to specific controller
     * @param event - clicked anchor event
     * @returns {boolean} - to prevent reloading
     * @private
     */
    #handleClickNavigationItem(event) {
        event.preventDefault();
        
        //Get the data-controller from the clicked element (this)
        const clickedAnchor = event.target;
        const controller = clickedAnchor.dataset.controller;

        if(typeof controller === "undefined") {
            console.error("No data-controller attribute defined in anchor HTML tag, don't know which controller to load!")
            return false;
        }

        const homeLink = this.#navbarView.querySelector(".navbar-brand");
        const activeLinks = this.#navbarView.querySelectorAll(".active-nav-link");

        homeLink.addEventListener("click", () => {
            const activeLinks = this.#navbarView.querySelectorAll(".active-nav-link");

            activeLinks.forEach((link) => {
                link.classList.remove("active-nav-link");
            });
        });

        activeLinks.forEach((link) => {
            link.classList.remove("active-nav-link");
        });

        clickedAnchor.classList.add("active-nav-link");

        //Pass the action to a new function for further processing
        App.loadController(controller);

        //Return false to prevent reloading the page
        return false;
    }
}
