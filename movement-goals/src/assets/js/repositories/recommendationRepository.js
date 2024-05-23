/**
 * Repository for entity recommendation - also interacts with networkmanager
 * @author Kaifie Dil.
 */

import {NetworkManager} from "../framework/utils/networkManager.js";

export class RecommendationRepository {
    #networkManager;
    #route;

    // Give the route a base variable
    constructor() {
        this.#route = "/recommendations"
        this.#networkManager = new NetworkManager();
    }

    /**
     * Sends the given user_id to the routes, by requesting the network manager to handle the get request
     *
     * @author Kaifie Dil
     * @param user_id  = the user id of the current user
     * @returns {Promise<*>}
     */
    checkRecommendation(user_id) {
        return this.#networkManager
            .doRequest(`${this.#route}/check/${user_id}`, "GET");
    }

    /**
     * Sends the given data to the routes, by requesting the network manager to handle the post request
     * @author Kaifie Dil.
     * @param user_id    = the user id of the current user
     * @param muscle     = whether muscle has been selected
     * @param bone       = whether bone has been selected
     * @param balance    = whether balance has been selected
     * @returns {Promise<*>}
     */
    updateRecommendation(user_id, muscle, bone, balance) {
        return this.#networkManager
            .doRequest(`${this.#route}/update`, "POST", {"user_id": user_id, "muscle": muscle, "cardio": bone, "balance": balance});
    }

    /**
     * Sends the given data to the routes, by requesting the network manager to handle the post request
     * @author Kaifie Dil.
     * @param user_id    = the user id of the current user
     * @param muscle     = whether muscle has been selected
     * @param bone       = whether bone has been selected
     * @param balance    = whether balance has been selected
     * @returns {Promise<*>}
     */
    saveRecommendation(user_id, muscle, bone, balance) {
        return this.#networkManager
            .doRequest(`${this.#route}/save`, "POST", {"user_id": user_id, "muscle": muscle, "cardio": bone, "balance": balance});
    }
    /**
     *
     * @param question_id
     * @param survey_id
     * @param user_id
     * @return {Promise<*>}
     * request with route for answers
     * @author Sara Benali
     */
    async getIntakeAnswers(question_id, survey_id, user_id){
        return await this.#networkManager.doRequest(`${this.#route}/${question_id}/calculations/${survey_id}/
        ${user_id}`, "GET");
    }

    /**
     *
     * @param bone
     * @return {Promise<*>}
     * request with route for bone activities
     */
    async getActivitiesBone(bone){
        return await this.#networkManager.doRequest(`${this.#route}/bone/${bone}`,
            "GET");
    }

    /**
     *
     * @param muscle
     * @return {Promise<*>}
     * request with route for muscle activities
     */
    async getActivitiesMuscle(muscle){
        return await this.#networkManager.doRequest(`${this.#route}/muscle/${muscle}`,
            "GET");
    }

    /**
     *
     * @param balance
     * @return {Promise<*>}
     * request with route for balance activities
     */

    async getActivitiesBalance(balance){
        return await this.#networkManager.doRequest(`${this.#route}/balance/${balance}`,
            "GET");
    }
}

