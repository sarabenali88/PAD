import {NetworkManager} from "../framework/utils/networkManager.js";

export class DashboardRepository {
    #networkManager;
    #route;


    /**
     * constructor
     * @author Kaifie Dil.
     */
    constructor() {
        this.#route = "/dashboard";
        this.#networkManager = new NetworkManager();
    }

    /**
     * Get the total amount of chosen activities that belong to the user_id
     *
     * @param {number} userId The id of the activity.
     * @returns {Promise<Array<Object>>} The total amount of questions.
     * @author Kaifie Dil.
     */
    async getTotalAmountOfActivities(userId) {
        return await this.#networkManager.doRequest(`${this.#route}/${userId}/check`, "GET");
    }

    /**
     * Get all the names for the activities that belong to the user_id
     *
     * @param {number} userId The id of the activity.
     * @returns {Promise<Array<Object>>} All the names for the activities
     * @author Kaifie Dil.
     */
    async getActivityNames(userId) {
        return await this.#networkManager.doRequest(`${this.#route}/${userId}/name`, "GET");
    }

    /**
     * Get the total amount of chosen goals that belong to the user_id
     *
     * @param {number} userId The id of the activity.
     * @returns {Promise<Array<Object>>} The total amount of goals.
     * @author Kaifie Dil.
     */
    async getGoalsPerWeek(userId) {
        return await this.#networkManager.doRequest(`${this.#route}/${userId}/perweek`, "GET");
    }

    /**
     * Update the amount of days spent on each goal for the user_id
     *
     * @param daysDone The amount of days completed for the week
     * @param {number} userId The id of the activity.
     * @param activityName The name of the activity that belongs to the days completed
     * @returns {Promise<Array<Object>>} the amount of days spent on each goal
     * @author Kaifie Dil.
     */
    async updateDaysDone(daysDone, userId, activityName) {
        return await this.#networkManager
            .doRequest(`${this.#route}/${userId}/daysdone`, "POST", {days_done: daysDone, user_id: userId, activity_name: activityName});
    }

    /**
     * Get the amount of days spent on each goal for the user_id
     *
     * @param {number} userId The id of the activity.
     * @returns {Promise<Array<Object>>} the amount of days spent on each goal
     * @author Kaifie Dil.
     */
    async getDaysDone(userId) {
        return await this.#networkManager.doRequest(`${this.#route}/${userId}/getdaysdone`, "GET");
    }

    async deleteGoal(userId, activityName) {
        return await this.#networkManager
            .doRequest(`${this.#route}/${userId}/deletegoal`, "POST", {user_id: userId, activity_name: activityName});
    }
}