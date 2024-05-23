/**
 * Repository for account entity
 * @author Sara Benali
 *
 */
import {NetworkManager} from "../framework/utils/networkManager.js";



export class accountRepository {
    #networkManager;
    #route;

    /**
     * constructor
     * @author Sara Benali
     */
    constructor() {
        this.#route = "/account";
        this.#networkManager = new NetworkManager();

    }

    /**
     * Post request for route
     * @param firstName first name of the user
     * @param lastName last name of the user
     * @param username username of the user
     * @param email email of the user
     * @param password password of the user
     * @return {Promise<*>|*}
     * @author Sara Benali
     */

    account(firstName, lastName, username, email, password){
        return this.#networkManager.doRequest(this.#route, "POST", {firstName: firstName, lastName: lastName,
        username: username, email: email, password: password});
    }

    /**
     * Adds the survey relation for the user.
     *
     * @param userId       the id of the user
     * @param surveyId     the id of the survey
     * @param lastAnswered the last answered question of the user
     * @returns {Promise<Object>}  Promise object containing the saved relation.
     * @author Tim Knops
     */
    async addSurveyRelation(userId, surveyId, lastAnswered) {
        return this.#networkManager.doRequest(
            `${this.#route}/add/survey`,
            "POST",
            {user_id: userId, survey_id: surveyId, last_answered: lastAnswered});
    }
}
