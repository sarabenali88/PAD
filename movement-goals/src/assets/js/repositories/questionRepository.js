import { NetworkManager } from "../framework/utils/networkManager.js";

/**
 * Repository for handling the switching between the types of questions in the survey.
 *
 * @author Tim Knops
 */
export class QuestionRepository {
    #route;
    #networkManager;

    /** Constructor. */
    constructor() {
        this.#route = "/question/type";
        this.#networkManager = new NetworkManager();
    }

    /**
     * Gets the type of question.
     *
     * @param questionOrder the order of the question in the survey
     * @param surveyId  id of the survey
     * @returns {Promise<Array<Object>>}  The id of the question.
     */
    async getQuestionType(questionOrder, surveyId) {
        return await this.#networkManager.doRequest(`${this.#route}/${surveyId}/${questionOrder}`, "GET");
    }
}