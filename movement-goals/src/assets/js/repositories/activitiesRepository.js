import { NetworkManager } from "../framework/utils/networkManager.js";

/**
 * Repository for all things related to the activities.
 *
 * @author Tim Knops
 */
export class ActivitiesRepository {
    #route;
    #networkManager;

    constructor() {
        this.#route = "/activities";
        this.#networkManager = new NetworkManager();
    }

    /**
     * Gets all the activities depending on the parameters given.
     *
     * For all parameters:
     * If you want the category included, set it as 1. If you do not, set is as 2.
     *
     * @param {number} bone    the bone category of the activity
     * @param {number} muscle  the muscle category of the activity
     * @param {number} balance the balance category of the activity
     * @returns {Promise<Array<Object>>} Array of object with all activities.
     * @author Tim Knops
     */
    async getActivities(bone, muscle, balance) {
        return await this.#networkManager.doRequest(`${this.#route}/${bone}/${muscle}/${balance}`, "GET");
    }

    /**
     * Saves the activities that the user has selected.
     *
     * @param {number} userId             the number of the user id
     * @param {Array} chosenActivitiesArr array of the ids of the activities that the user has chosen
     * @returns {Promise<Object>}  Object containing all saved activities.
     * @author Tim Knops
     */
    async saveActivities(userId, chosenActivitiesArr) {
        return await this.#networkManager.doRequest(
            `${this.#route}/save`, "POST", {chosenActivities: chosenActivitiesArr, user_id: userId})
    }

    /**
     * Gets the chosen recommendations of the user.
     *
     * @param userId  the id of the user
     * @returns {Promise<Array<Object>>} Array of object with the chosen activities.
     * @author Tim Knops
     */
    async getChosenRecommendations(userId) {
        return await this.#networkManager.doRequest(`${this.#route}/chosen_recommendations/${userId}`, "GET");
    }
}