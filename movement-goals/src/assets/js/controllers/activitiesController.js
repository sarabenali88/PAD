import { Controller } from "./controller.js";
import { ActivitiesRepository } from "../repositories/activitiesRepository.js";
import { App } from "../app.js";

/**
 * Controller class for all things related to the activities.
 *
 * @author Tim Knops
 */
export class ActivitiesController extends Controller {
    #activitiesView;
    #activitiesRepository;
    #recommendedActivities;

    constructor() {
        super();
        this.#activitiesRepository = new ActivitiesRepository();

        this.#setupView();
    }

    /**
     * Sets up the view for the activities.
     *
     * @author Tim Knops
     */
    async #setupView() {
        this.#activitiesView = await super.loadHtmlIntoContent("html_views/activities.html");

        const chosenRecommendations = await this.#activitiesRepository.getChosenRecommendations(App.sessionManager.get("user_id"));

        // If you want all activities that improve muscle, you'd set muscle = 1.
        // If you do not want balance and bone to go with that, set bone = 2 and balance = 2.
        this.#recommendedActivities = await this.#activitiesRepository.getActivities(
            chosenRecommendations[0].bone.data[0] === 0 ? 2 : 1,
            chosenRecommendations[0].muscle.data[0] === 0 ? 2 : 1,
            chosenRecommendations[0].balance.data[0] === 0 ? 2 : 1);

        this.#createActivities();
        this.#addActivitySelection();
        this.#handleModal();
    }

    /**
     * Adds all activities to the view, uses a template to clone.
     *
     * @author Tim Knops
     */
    #createActivities() {
        const activityTemplate = this.#activitiesView.querySelector("#activity-template");
        const activitiesDiv = this.#activitiesView.querySelector(".activities");

        for (let i = 0; i < this.#recommendedActivities.length; i++) {
            const activityTemplateClone = activityTemplate.content.cloneNode(true);
            activityTemplateClone.firstElementChild.setAttribute("id",
                `${this.#recommendedActivities[i].activity_name}`);
            activityTemplateClone.firstElementChild.firstElementChild.innerHTML =
                this.#recommendedActivities[i].activity_name;

            activitiesDiv.appendChild(activityTemplateClone);
            this.#addIconsToActivity(i);
        }
    }

    /**
     * Adds the icons that belong to each activity, to each activity.
     *
     * @param {number} index  the index of the activity.
     * @author Tim Knops
     */
    #addIconsToActivity(index) {
        const iconTemplate = this.#activitiesView.querySelector("#icon-template");
        const activityIconContainer = this.#activitiesView.querySelector(`#${this.#recommendedActivities[index].activity_name}`).getElementsByClassName("icons-container");

        if (this.#recommendedActivities[index].muscle.data[0]) {
            const iconTemplateClone = iconTemplate.content.cloneNode(true);
            iconTemplateClone.firstElementChild.classList.add("fa-dumbbell");
            activityIconContainer[0].appendChild(iconTemplateClone);
        }

        if (this.#recommendedActivities[index].bone.data[0]) {
            const iconTemplateClone = iconTemplate.content.cloneNode(true);
            iconTemplateClone.firstElementChild.classList.add("fa-bone");
            activityIconContainer[0].appendChild(iconTemplateClone);
        }

        if (this.#recommendedActivities[index].balance.data[0]) {
            const iconTemplateClone = iconTemplate.content.cloneNode(true);
            iconTemplateClone.firstElementChild.classList.add("fa-scale-balanced");
            activityIconContainer[0].appendChild(iconTemplateClone);
        }
    }

    /**
     * Adds the effect of selecting an activity.
     *
     * @author Tim Knops
     */
    #addActivitySelection() {
        for (let i = 0; i < this.#recommendedActivities.length; i++) {
            const activity = this.#activitiesView.querySelector(`#${this.#recommendedActivities[i].activity_name}`);
            const icons = activity.getElementsByClassName("icons-container")[0].children;

            activity.addEventListener("click", () => {
                if (activity.classList.contains("chosen-activity")) { // If the activity is already chosen.
                    activity.classList.remove("chosen-activity");

                    activity.classList.add("bg-white");
                    activity.firstElementChild.classList.remove("text-white");


                    for (let i = 0; i < icons.length; i++) {
                        icons[i].classList.remove("chosen-activity-icon");
                        icons[i].classList.add("non-chosen-activity-icon");
                    }

                } else {
                    this.#handleErrorMessage(false);

                    activity.classList.add("chosen-activity");
                    activity.firstElementChild.classList.add("text-white");
                    activity.classList.remove("bg-white");

                    for (let i = 0; i < icons.length; i++) {
                        icons[i].classList.add("chosen-activity-icon");
                        icons[i].classList.remove("non-chosen-activity-icon");
                    }
                }
            });
        }
    }

    /**
     * Handles everything related to the confirmation modal.
     *
     * @author Tim Knops
     */
    #handleModal() {
        const button = this.#activitiesView.querySelector(".btn");
        const modalBody = this.#activitiesView.querySelector(".modal-body");
        const modal = new bootstrap.Modal(this.#activitiesView.querySelector("#confirmation-modal"));

        button.addEventListener("click", () => {
            const chosenActivities = this.#activitiesView.querySelectorAll(".chosen-activity");

            if (chosenActivities.length === 0) { // If no activities have been selected.
                this.#handleErrorMessage(true);
            } else {
                modalBody.innerHTML = "Weet u zeker dat u de volgende activiteiten wilt opslaan?";
                chosenActivities.forEach(chosenActivity => {
                    modalBody.innerHTML += `<br> - ${chosenActivity.firstElementChild.textContent}`;
                });

                modal.show();
            }
        });

        this.#handleModalCloseButtons(modal);
        this.#handleModalSaveButton();
    }

    /**
     * Shows the error message if show is set to true.
     *
     * @param {boolean} show  on true shows, else it is hidden
     * @author Tim Knops
     */
    #handleErrorMessage(show) {
        const errorDiv = this.#activitiesView.querySelector(".alert-div");
        const buttonDiv = this.#activitiesView.querySelector(".button-div");

        if (show) {
            errorDiv.classList.remove("d-none");
            buttonDiv.classList.remove("my-5");
            buttonDiv.classList.add("mb-2", "mt-4");
        } else {
            errorDiv.classList.add("d-none");
            buttonDiv.classList.remove("mb-2", "mt-4");
            buttonDiv.classList.add("my-5");
        }
    }

    /**
     * Adds event listeners on the close buttons of the modal.
     *
     * @param {Object} modal  the bootstrap modal object
     * @author Tim Knops
     */
    #handleModalCloseButtons(modal) {
        const modalCloseButtons = this.#activitiesView.querySelectorAll(".close-confirmation-modal");

        modalCloseButtons.forEach(closeButton => {
            closeButton.addEventListener("click", () => {
                modal.hide();
            });
        });
    }

    /**
     * Saves the activities that have been chosen when the save changes button is clicked.
     *
     * @author Tim Knoops
     */
    #handleModalSaveButton() {
        const saveButton = this.#activitiesView.querySelector("#confirmation-modal-save");

        saveButton.addEventListener("click", async () => {
            const chosenActivities = this.#activitiesView.querySelectorAll(".chosen-activity");

            let chosenActivitiesArr = [];
            for (let i = 0; i < chosenActivities.length; i++) {
                chosenActivitiesArr.push(chosenActivities[i].id);
            }

            await this.#activitiesRepository.saveActivities(App.sessionManager.get("user_id"), chosenActivitiesArr);

            App.loadController(App.CONTROLLER_HOME);
            location.reload();
        });
    }
}