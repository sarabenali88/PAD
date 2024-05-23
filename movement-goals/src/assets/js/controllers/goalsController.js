import {Controller} from "./controller.js";
import {GoalsRepository} from "../repositories/goalsRepository.js";
import {App} from "../app.js";

/**
 * Controller for the goals
 * @author Sara Benali
 */

export class GoalsController extends Controller {
    #goalsView;
    #goalsRepository;
    #userInputDays;
    #userInputTime;
    #userId;
    #userInputActivity;
    #isSubmitted;

    /**
     * constructor
     *
     * @author Sara Benali
     */
    constructor() {
        super();
        this.#userInputActivity = "";
        this.#userInputDays = "";
        this.#userInputTime = "";
        this.#isSubmitted = false;
        this.#userId = App.sessionManager.get("user_id");
        this.#goalsRepository = new GoalsRepository();
        this.#setUpView();
    }

    /**
     * sets up the view for the goals
     * @return {Promise<void>}
     * @author Sara Benali
     */
    async #setUpView() {
        this.#goalsView = await super.loadHtmlIntoContent("html_views/goals.html");
        const form = this.#goalsView.querySelector('#form');
        form.addEventListener("submit", async (e) => {
            e.preventDefault();
            this.#validateUserInput();
            await this.#saveGoals();

        });
        await this.#getUserActivities(this.#userId);
    }

    /**
     * clones rows based on the amount of activities chosen by the user and inserts the chosen activities
     * @param user_id id of the user
     * @author Sara Benali
     */
    #getUserActivities(user_id) {
        const tableBody = this.#goalsView.querySelector('#goalsInput');
        this.#goalsRepository.getUserActivities(user_id).then((result) => {
            let resultActivities;
            let cloneActivity;
            let clone;
            for (let i = 0; i < result.length; i++) {
                resultActivities = result[i].activity_name;
                cloneActivity = this.#goalsView.querySelector('#activityTemplate');
                clone = document.importNode(cloneActivity.content, true);
                const inputs = clone.querySelectorAll('#activities');
                inputs[0].value = resultActivities;
                tableBody.appendChild(clone);
            }
        });
    }

    /**
     * validates the input of the user
     * @author Sara Benali
     *
     */
    #validateUserInput() {
        let daysPer = this.#goalsView.querySelectorAll("#daysPer");
        let timePer = this.#goalsView.querySelectorAll(".time-per-select");
        let error = this.#goalsView.querySelector("#error");
        let errorTemplate = error.content.cloneNode(true);
        let button = this.#goalsView.querySelector("#button-container");
        let alert = this.#goalsView.querySelector(".alert");
        let errorMsg = "";
        let hasError = false;
        let isValid = true;

        for (let i = 0; i < daysPer.length; i++) {
            if (alert !== null) {
                alert.remove();
            }
            if (daysPer[i].value > 7 || daysPer[i].value < 1 && alert === null) {
                daysPer[i].classList.remove('is-valid');
                daysPer[i].classList.add('is-invalid');
                errorMsg = "Aantal dagen mag niet kleiner dan 1 of groter dan 7 zijn";
                hasError = true
                isValid = false;
            } else if (daysPer[i].value > 0) {
                daysPer[i].classList.remove('is-invalid!');
                daysPer[i].classList.add('is-valid');
            }
            if (daysPer[i].value === '') {
                daysPer[i].classList.remove('is-valid');
                daysPer[i].classList.add('is-invalid');
                errorMsg = "Uw heeft nog geen gegevens ingevoerd!";
                hasError = true
                isValid = false;
            } else if (isNaN(daysPer[i].value) && alert === null) {
                daysPer[i].classList.remove('is-valid');
                daysPer[i].classList.add('is-invalid');
                errorMsg = "Ingevoerd gegeven is geen getal!";
                hasError = true;
                isValid = false;
            } else if (daysPer[i].classList.contains("is-valid")) {
                daysPer[i].classList.remove("is-invalid");
                daysPer[i].classList.add("is-valid");
            }
        }

        for (let i = 0; i < timePer.length; i++) {
            if (alert === null && isNaN(timePer[i].value)) {
                timePer[i].classList.remove('is-valid');
                timePer[i].classList.add('is-invalid');
                errorMsg = "Ingevoerd gegeven is geen getal!";
                hasError = true
                isValid = false;
            } else if (alert === null && timePer[i].value === '') {
                timePer[i].classList.remove('is-valid');
                timePer[i].classList.add('is-invalid');
                errorMsg = "Uw heeft nog geen gegevens ingevoerd!";
                hasError = true
                isValid = false;
            } else if (i % 2 === 0 && (timePer[i].value < 0 || timePer[i].value > 24)) {
                isValid = false;
                if (alert === null && timePer[i].value < 0) {
                    timePer[i].classList.remove('is-valid');
                    timePer[i].classList.add('is-invalid');
                    errorMsg = "Getal mag niet kleiner dan 0 zijn!";
                    hasError = true
                } else if (timePer[i].value > 24) {
                    timePer[i].classList.remove('is-valid');
                    timePer[i].classList.add('is-invalid');
                    errorMsg = "Aantal uur kan niet langer dan 24 zijn!";
                    hasError = true
                }

            } else if (i % 1 === 0 && (timePer[i].value < 0 || timePer[i].value > 59)) {
                isValid = false;
                if (alert === null && timePer[i].value < 0) {
                    timePer[i].classList.remove('is-valid');
                    timePer[i].classList.add('is-invalid');
                    errorMsg = "Getal mag niet kleiner dan 0 zijn!";
                    hasError = true
                } else if (timePer[i].value > 59) {
                    timePer[i].classList.remove('is-valid');
                    timePer[i].classList.add('is-invalid');
                    errorMsg = "Als u meer dan 59 minuten per dag heeft ingevoerd, voeg dit a.u.b toe aan" +
                        " het aantal uur!";
                    hasError = true
                }
            }
            else if (timePer[i].classList.contains("is-invalid")) {
                timePer[i].classList.remove("is-invalid");
                timePer[i].classList.add("is-valid");
            } else {
                timePer[i].classList.add("is-valid");
            }
        }

        if (hasError) {
            errorTemplate.firstElementChild.innerHTML = errorMsg;
            if (button.children.length === 1) {
                button.insertBefore(errorTemplate, this.#goalsView.querySelector("#button-container").children[0]);
            } else {
                button.replaceChild(errorTemplate, this.#goalsView.querySelector("#button-container").children[0])
            }
        }
        return isValid;
    }

    /**
     * adds the goals in separate rows with their values
     * @author Sara Benali
     */
    #saveGoals() {
        if (!this.#isSubmitted && this.#validateUserInput()) {
            this.#isSubmitted = true;
            let activity = this.#goalsView.querySelectorAll('#activities');
            let daysPer = this.#goalsView.querySelectorAll("#daysPer");
            let hoursPer = this.#goalsView.querySelectorAll("#hoursPer");
            let minPer = this.#goalsView.querySelectorAll("#minPer");

            for (let i = 0; i < activity.length; i++) {
                this.#userInputActivity = activity[i].value;
                this.#userInputDays = daysPer[i].value;
                this.#userInputTime = hoursPer[i].value + " uur " + minPer[i].value + " min";

                this.#goalsRepository.insertGoals(this.#userId, this.#userInputActivity,
                    this.#userInputDays, this.#userInputTime);
            }
        }
    }

}