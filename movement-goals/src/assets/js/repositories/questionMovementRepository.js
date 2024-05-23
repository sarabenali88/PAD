import { NetworkManager } from "../framework/utils/networkManager.js";

/**
 * Repository for all things related to the QuestionMovementRoutes.
 *
 * @author Tim Knops
 */
export class QuestionMovementRepository {
    #route;
    #networkManager;

    /** Constructor. */
    constructor() {
        this.#route = "/intake/question";
        this.#networkManager = new NetworkManager();
    }

    /**
     * Get the title and description of the question.
     *
     * @param {number} questionOrder The order number of the question.
     * @returns {Promise<Array<Object>>} The the title and description of a question.
     * @author Tim Knops
     */
    async getTitle(questionOrder) {
        return await this.#networkManager.doRequest(`${this.#route}/${questionOrder}`, "GET");
    }

    /**
     * Get all values from the question movement table, excluding the ids.
     *
     * @param {number} questionOrder The order number of the question.
     * @returns {Promise<Array<Object>>} All values from the question movement table.
     * @author Tim Knops
     */
    async getQuestionMovementData(questionOrder) {
        return await this.#networkManager.doRequest(`${this.#route}/${questionOrder}/movement`, "GET");
    }

    /**
     * Post an answer to a question.
     *
     * @param {number} questionOrder The order number of the question.
     * @param {number} questionId The id of the question.
     * @param {number} surveyId The id of the survey.
     * @param {number} userId The id of the user.
     * @param {string} text The formatted question answer.
     * @returns {Promise<Object>} Object containing all answer input fields.
     * @author Tim Knops
     */
    async postQuestionMovementAnswer(questionOrder, questionId, surveyId, userId, text) {
        return await this.#networkManager.doRequest(
            `${this.#route}/${questionOrder}/movement`,
            "POST",
            {question_id: questionId, survey_id: surveyId, user_id: userId, text: text});
    }

    /**
     * Get the answer of the specified questionId.
     *
     * @param {number} surveyId The id of the survey.
     * @param {number} questionId The id of the question.
     * @param {number} userId The id of the user.
     * @returns {Promise<Array<Object>>} The answer of the questionId.
     * @author Tim Knops
     */
    async getQuestionAnswer(surveyId, questionId, userId) {
        return await this.#networkManager.doRequest(`/intake/${surveyId}/question/${questionId}/${userId}`, "GET");
    }

    /**
     * Update the answer of the specified questionId.
     *
     * @param {string} answer The formatted string that needs to replace the previous answer.
     * @param {number} questionId The id of the question.
     * @param {number} surveyId The id of the survey.
     * @param {number} userId The id of the user.
     * @returns {Promise<Object>} Object containing all the answer input fields.
     * @author Tim Knops
     */
    async updateQuestionAnswer(answer, questionId, surveyId, userId) {
        return await this.#networkManager.doRequest(
            `${this.#route}/movement/update`,
            "POST",
            {text: answer, question_id: questionId, survey_id: surveyId, user_id: userId});
    }

    /**
     * Get the last answered question number.
     *
     * @param {number} surveyId The id of the survey.
     * @param {number} userId The id of the user.
     * @returns {Promise<Array<Object>>} The last answered question order number.
     * @author Tim Knops
     */
    async getLastAnsweredQuestionOrderNum(surveyId, userId) {
        return await this.#networkManager.doRequest(`/intake/${surveyId}/${userId}`, "GET");
    }

    /**
     * Update the last answered question number.
     *
     * @param {number} lastAnsweredNum The number of the newly last answered question.
     * @param {number} surveyId The id of the survey.
     * @param {number} userId The id of the user.
     * @returns {Promise<Object>} Object that contains the updated values.
     * @author Tim Knops
     */
    async updateLastAnsweredQuestionOrderNum(lastAnsweredNum, surveyId, userId) {
        return await this.#networkManager.doRequest(
            "/intake/last_answered/update",
            "POST",
            {last_answered: lastAnsweredNum, survey_id: surveyId, user_id: userId});
    }

    /**
     * Get the total amount of questions that are in the surveyId.
     *
     * @param {number} surveyId The id of the survey.
     * @returns {Promise<Array<Object>>} The total amount of questions.
     * @author Tim Knops
     */
    async getTotalAmountOfQuestions(surveyId) {
        return await this.#networkManager.doRequest(`${this.#route}/survey/${surveyId}/amount`, "GET");
    }
}
