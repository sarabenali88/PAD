import {Controller} from "./controller.js";
import {DashboardRepository} from "../repositories/dashboardRepository.js";
import { App } from "../app.js";

/**
 * Controller for dashboard screen and user interaction
 * @author Kaifie Dil.
 */
export class DashboardController extends Controller {
    #dashboardRepository;
    #dashboardView;
    #totalAmountOfActivities;
    #activityNames;
    #goalsPerWeek;
    #finished;
    #userId;

    /**
     * Constructor for the controller
     * @author Kaifie Dil.
     */
    constructor() {
        super();
        this.#dashboardRepository = new DashboardRepository();
        this.#userId = App.sessionManager.get("user_id");
        this.#setupView();
    }

    /**
     * Sets up the base html view and starts all important functions
     * @returns {Promise<void>}
     * @author Kaifie Dil.
     */
    async #setupView() {
        // Get all important data from the database that will be used in setting up the view
        this.#totalAmountOfActivities = await this.#dashboardRepository.getTotalAmountOfActivities(this.#userId);
        this.#activityNames = await this.#dashboardRepository.getActivityNames(this.#userId)
        this.#goalsPerWeek = await this.#dashboardRepository.getGoalsPerWeek(this.#userId)
        this.#finished = await this.#dashboardRepository.getDaysDone(this.#userId);

        // If null is present in the array for days done, replace it was a zero
        for (let i = 0; i < this.#totalAmountOfActivities[0].chosen_activities; i++) {
            if (this.#finished[i].days_done == null || this.#finished[i].days_done === undefined) {
                this.#finished[i].days_done = 0;
                await this.#dashboardRepository.updateDaysDone(this.#finished[i].days_done, this.#userId, this.#finished[i].activity_name)
            }
            // If days done is bigger than possible, limit the number to the max number so you cant see 2/1 as an example
            for (let j = 0; j < this.#totalAmountOfActivities[0].chosen_activities; j++) {
                if (this.#finished[i].days_done > this.#goalsPerWeek[j].days_per_week && this.#finished[i].activity_name === this.#goalsPerWeek[j].activity_name) {
                    this.#finished[i].days_done = this.#goalsPerWeek[j].days_per_week;
                    await this.#dashboardRepository.updateDaysDone(this.#finished[i].days_done, this.#userId, this.#finished[i].activity_name)
                }
            }
        }

        // Load the view into the html
        this.#dashboardView = await super.loadHtmlIntoContent("html_views/dashboard.html")

        this.setup();
    }

    /**
     * Sets up the templates and progress bars
     * @author Kaifie Dil.
     */
    async setup() {
        // Get the total length of the total amount of activties and make an array with that length
        let length = this.#totalAmountOfActivities[0].chosen_activities;
        let numbers = new Array(length)

        // For the length, add a new template to the screen and update its text and progress bar
        for (let i = 0; i < length; i++) {
            let temp = document.getElementsByTagName("template")[0];
            let clone = temp.content.cloneNode(true);
            document.querySelector(".cook").appendChild(clone);
            // Fill the array with the values of the data gotten from the database
            numbers[i] = this.#goalsPerWeek[i].days_per_week;

            // Select the items from the template for each individual template
            let activityNameElement = document.querySelectorAll(".titel")[i];
            let progressBar = document.querySelectorAll(".progress-bar")[i];
            let progressBarText = document.querySelectorAll(".progress-text")[i];

            // Calculate the percentage of the progressbar, by using the update function
            this.#dashboardView.querySelectorAll(".btn-update")[i].addEventListener("click", () => this.#update(this.#goalsPerWeek[i].days_per_week, i, this.#goalsPerWeek[i].activity_name))
            progressBarText.innerHTML = `${this.#finished[i].days_done}/${numbers[i]} dagen afgerond`


            // Do the same for the first load of the page
            let initialTotal = this.#finished[i].days_done / numbers[i] * 100;
            progressBar.style.width = `${initialTotal}%`;

            // Change the color of the bar on first load of the page
            if (initialTotal <= 25) {
                progressBar.classList.add("bg-danger");
                progressBar.classList.remove("bg-warning");
                progressBar.classList.remove("bg-success");
            } else if (initialTotal <= 50) {
                progressBar.classList.remove("bg-danger");
                progressBar.classList.add("bg-warning");
                progressBar.classList.remove("bg-success");
            } else if (initialTotal > 50) {
                progressBar.classList.remove("bg-danger");
                progressBar.classList.remove("bg-warning");
                progressBar.classList.add("bg-success");
            }
            // Add the name of the activity to the progression card
            activityNameElement.innerHTML = this.#finished[i].activity_name;
        }
    }

    /**
     * Sets up the popup and allows the user to click on the buttons in the popup
     * @param number  = number of days for this goal
     * @param current = current number of the template in the for loop
     * @param name    = name of the current goal thats being updated
     * @returns {*}
     * @author Kaifie Dil.
     */
    #update(number, current, name) {
        // Select the popup from the page and show it
        let popup = this.#dashboardView.querySelector(".popup");
        popup.classList.add("open-popup");

        // Remove previous event listeners for the ".ja" button
        const jaButton = this.#dashboardView.querySelector(".ja");
        const jaButtonClone = jaButton.cloneNode(true);
        jaButton.replaceWith(jaButtonClone);

        // Add new event listener for the ".ja" button
        jaButtonClone.addEventListener("click", async () => {
            if (this.#finished[current].days_done < this.#goalsPerWeek[current].days_per_week && name === this.#finished[current].activity_name) {
                this.#finished[current].days_done++;
                this.progressUpdate(number, current);

                // Update only data when the name is correct, prevents wrong data from being changed
                for (let i = 0; i < this.#totalAmountOfActivities[0].chosen_activities; i++) {
                    if (this.#finished[current].activity_name === this.#finished[i].activity_name) {
                        await this.#dashboardRepository.updateDaysDone(this.#finished[current].days_done, this.#userId, this.#finished[current].activity_name);
                    }
                }
                popup.classList.remove("open-popup");
            } else if (this.#finished[current].days_done === this.#goalsPerWeek[current].days_per_week) {
                alert("Je hebt jouw doel al afgerond!");
                popup.classList.remove("open-popup");
            } else {
                if (this.#finished[current].days_done > number) {
                    this.#finished[current].days_done = number;
                }

                popup.classList.remove("open-popup");
            }
            name = 0;
        });

        // Remove previous event listeners for the ".nee" button
        const neeButton = this.#dashboardView.querySelector(".nee");
        const neeButtonClone = neeButton.cloneNode(true);
        neeButton.replaceWith(neeButtonClone);

        // Add new event listener for the ".nee" button
        neeButtonClone.addEventListener("click", () => {
            popup.classList.remove("open-popup");
        });

        // Remove previous event listeners for the ".verwijder" button
        const removeButton = this.#dashboardView.querySelector(".verwijder");
        const removeButtonClone = removeButton.cloneNode(true);
        removeButton.replaceWith(removeButtonClone);

        // Add new event listener for the ".verwijder" button
        removeButtonClone.addEventListener("click", async () => {
            let confirmation = confirm("Weet u zeker dat u dit doel wilt verwijderen?");

            if (confirmation === true) {
                await this.#dashboardRepository.deleteGoal(this.#userId, this.#finished[current].activity_name);
                popup.classList.remove("open-popup");
                location.reload();
            } else {
                popup.classList.remove("open-popup");
            }
        });
    }

    /**
     * Sets up the whole system for calculating and updating the progress bars
     * @param number  = number of days for this goal
     * @param current = current number of the template in the for loop
     * @author Kaifie Dil.
     */
    progressUpdate(number, current) {
        // Calculate the total percentage and update the bar
        let total = this.#finished[current].days_done / number * 100;
        let progressBar = document.querySelectorAll(".progress-bar")[current];
        let progressBarText = document.querySelectorAll(".progress-text")[current];
        progressBar.style.width = `${total}%`;

        if (total <= 25) {
            progressBar.classList.add("bg-danger");
            progressBar.classList.remove("bg-warning");
            progressBar.classList.remove("bg-success");
            progressBar.classList.remove("bg-info");
        } else if (total <= 50) {
            progressBar.classList.remove("bg-danger");
            progressBar.classList.add("bg-warning");
            progressBar.classList.remove("bg-success");
            progressBar.classList.remove("bg-info");
        } else if (total > 50) {
            progressBar.classList.remove("bg-danger");
            progressBar.classList.remove("bg-warning");
            progressBar.classList.add("bg-success");
            progressBar.classList.remove("bg-info");
        }

        progressBarText.innerHTML = `${this.#finished[current].days_done}/${number} dagen afgerond`
        current = null;
    }
}
