/**
 *
 * Repository for recommendations calculations
 * @author Sara Benali
 *
 */
import {NetworkManager} from "../framework/utils/networkManager.js";

export class RecommendationsCalcRepository{
    #networkManager;
    #route;


    /**
     * constructor
     * @author Sara Benali
     *
     */

    constructor() {
        this.#networkManager = new NetworkManager();
        this.#route = "/recommendations";
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