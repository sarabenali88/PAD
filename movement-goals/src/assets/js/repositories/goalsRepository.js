import {NetworkManager} from "../framework/utils/networkManager.js";

/**
 * Repository for goals entity
 * @author Sara Benali
 *
 *
 */

export class GoalsRepository {
    #route;
    #networkManager

    /**
     * constructor
     * @author Sara Benali
     */
    constructor() {
        this.#route = "/goals/activities";
        this.#networkManager = new NetworkManager();
    }

    /**
     * requests the chosen activities of the user
     * @param {number} user_id id of the user
     * @return {Promise<*>}
     * @author Sara Benali
     */
    async getUserActivities(user_id) {
        return await this.#networkManager.doRequest(`${this.#route}/${user_id}`, "GET");
    }

    /**
     * requests to insert the user input in the database
     * @param {number} user_id id of the user
     * @param {string} activity_name name of the activity
     * @param {string} days_per_week amount of days
     * @param {string} time_per_day amount of time
     * @return {Promise<*>}
     * @author Sara Benali
     */
    async insertGoals(user_id, activity_name, days_per_week, time_per_day) {
        return await this.#networkManager.doRequest(this.#route, "POST", {
            user_id: user_id, activity_name: activity_name, days_per_week: days_per_week, time_per_day: time_per_day
        });
    }
}