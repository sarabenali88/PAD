import { NetworkManager } from "../framework/utils/networkManager.js";

/**
 * Repository for all calendar routes.
 *
 * @author Tim Knops
 */
export class CalendarRepository {
    #route;
    #networkManager;

    /** Constructor */
    constructor() {
        this.#route = "/calendar";
        this.#networkManager = new NetworkManager();
    }

    /**
     * Get all the events that the user has.
     *
     * @param {number} userId             the id of the user
     * @returns {Promise<Array<Object>>}  Array of objects with the events.
     * @author Tim Knops
     */
    async getAllEvents(userId) {
        return await this.#networkManager.doRequest(`${this.#route}/events/${userId}`, "GET");
    }

    /**
     * Save all the events of the user.
     *
     * @param {number} userId            the id of the user
     * @param {Array<Object>} eventsArr  array of objects containing the events that are to be saved
     * @returns {Promise<Object>}        Object containing all saved events.
     * @author Tim Knops
     */
    async saveAllEvents(userId, eventsArr) {
        return await this.#networkManager.doRequest(
            `${this.#route}/events/save`,
            "POST",
            {user_id: userId, eventsArr: eventsArr});
    }

    /**
     * Get all the chosen activities by the user.
     *
     * @param {number} userId            the id of the user
     * @returns {Promise<Array<Object>>} Array of objects containing all chosen activities.
     * @author Tim Knops
     */
    async getChosenActivities(userId) {
        return await this.#networkManager.doRequest(`${this.#route}/activities/${userId}`, "GET");
    }
}