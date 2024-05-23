/**
 * Repository for entity open question
 * @author Sara Benali
 *
 */
import {NetworkManager} from "../framework/utils/networkManager.js";

export class OpenQuestionRepository {
    #networkManager;
    #route;


    /**
     * constructor
     * @author Sara Benali
     */
    constructor() {
        this.#route = "/intake/movement";
        this.#networkManager = new NetworkManager();
    }

    /**
     *
     * @param question_id
     * @return {Promise<*>}
     * get request for title
     * @author Sara Benali
     */
    async getTitle(question_id){
        return await this.#networkManager.doRequest(`${this.#route}/${question_id}`, "GET");
    }

    /**
     *
     * @param question_movement_id
     * @return {Promise<*>}
     * get request for question
     * @author Sara Benali
     */
    async getQuestion(question_movement_id){
        return await this.#networkManager.doRequest(`${this.#route}/question/${question_movement_id}`,
            "GET");
    }
}