/**
 * All routes related to the question movement type from the movement questions survey.
 *
 * @author Tim Knops
 */
class QuestionMovementRoutes {
    #app;
    #databaseHelper = require("../framework/utils/databaseHelper.js");
    #errorCodes = require("../framework/utils/httpErrorCodes.js")

    /**
     * Constructor.
     *
     * @param app  server application
     */
    constructor(app) {
        this.#app = app;

        this.#getQuestionTypeMovement();
        this.#getQuestionTitle();
        this.#insertQuestionAnswer();
        this.#getQuestionAnswer();
        this.#updateQuestionAnswer();
        this.#getLastAnsweredQuestion();
        this.#updateLastAnsweredQuestion();
        this.#getTotalAmountOfQuestions();
    }

    /**
     * Get all values of the question type movement.
     *
     * @route {GET} /intake/question/:question_order/movement
     * @author Tim Knops
     */
    #getQuestionTypeMovement() {
        this.#app.get("/intake/question/:question_order/movement", async (req, res) => {
            try {
                const data = await this.#databaseHelper.handleQuery({
                    query:  "SELECT\n" +
                            "    question_movement.text,\n" +
                            "    question_movement.days_per,\n" +
                            "    question_movement.time_per,\n" +
                            "    question_movement.intensity,\n" +
                            "    question_movement.not_applicable\n" +
                            "FROM question_movement\n" +
                            "         INNER JOIN question_movement_order\n" +
                            "                    ON question_movement_order.question_movement_id = question_movement.question_movement_id\n" +
                            "         INNER JOIN question\n" +
                            "                    ON question.question_id = question_movement_order.question_id\n" +
                            "WHERE question.order = ?" +
                            "ORDER BY question_movement_order.order;",
                    values: [req.params.question_order]
                });

                res.status(this.#errorCodes.HTTP_OK_CODE).json(data);
            } catch (e) {
                res.status(this.#errorCodes.BAD_REQUEST_CODE).json({reason: e});
            }
        });
    }

    /**
     * Insert an answer to a question.
     *
     * @route {POST} /intake/question/:question_order/movement
     * @author Tim Knops
     */
    #insertQuestionAnswer() {
        this.#app.post("/intake/question/:question_order/movement", async (req, res) => {
            try {
                const data = await this.#databaseHelper.handleQuery({
                    query: "INSERT INTO answer(question_id, survey_id, user_id, text) VALUES (?, ?, ?, ?);",
                    values: [req.body.question_id, req.body.survey_id, req.body.user_id, req.body.text]
                });

                res.status(this.#errorCodes.HTTP_OK_CODE).json(data);
            } catch (e) {
                res.status(this.#errorCodes.BAD_REQUEST_CODE).json({reason: e});
            }
        });
    }

    /**
     * Updates a question answer.
     *
     * @route {POST} /intake/question/movement/update
     * @author Tim Knops
     */
    #updateQuestionAnswer() {
        this.#app.post("/intake/question/movement/update", async (req, res) => {
            try {
                const data = await this.#databaseHelper.handleQuery({
                    query: "UPDATE answer SET text = ? WHERE question_id = ? AND survey_id = ? AND user_id = ?;",
                    values: [req.body.text, req.body.question_id, req.body.survey_id, req.body.user_id]
                });

                res.status(this.#errorCodes.HTTP_OK_CODE).json(data);
            } catch (e) {
                res.status(this.#errorCodes.BAD_REQUEST_CODE).json({reason: e});
            }
        });
    }

    /**
     * Get the question answer.
     *
     * @route {GET} /intake/:survey_id/question/:question_id/:user_id
     * @author Tim Knops
     */
    #getQuestionAnswer() {
        this.#app.get("/intake/:survey_id/question/:question_id/:user_id", async (req, res) => {
            try {
                const data = await this.#databaseHelper.handleQuery({
                    query: "SELECT * FROM answer WHERE question_id = ? AND survey_id = ? AND user_id = ?;",
                    values: [req.params.question_id, req.params.survey_id, req.params.user_id]
                });

                res.status(this.#errorCodes.HTTP_OK_CODE).json(data);
            } catch (e) {
                res.status(this.#errorCodes.BAD_REQUEST_CODE).json({reason: e});
            }
        });
    }

    /**
     * Get the title and description for the question.
     *
     * @route {GET} /intake/question/:question_order
     * @author Tim Knops
     */
    #getQuestionTitle() {
        this.#app.get("/intake/question/:question_order", async (req, res) => {
           try {
               const data = await this.#databaseHelper.handleQuery({
                   query: "SELECT \n" +
                          "    question_id, \n" +
                          "    title, \n" +
                          "    text \n" +
                          "FROM \n" +
                          "    question\n" +
                          "WHERE \n" +
                          "    question.question_type_id = 3 AND question.`order` = ?;",
                   values: [req.params.question_order]
               });

               res.status(this.#errorCodes.HTTP_OK_CODE).json(data);
           } catch (e) {
               res.status(this.#errorCodes.BAD_REQUEST_CODE).json({reason: e});
           }
        });
    }

    /**
     * Get the last answered question number.
     *
     * @route {GET} /intake/:survey_id/:user_id
     * @author Tim Knops
     */
    #getLastAnsweredQuestion() {
        this.#app.get("/intake/:survey_id/:user_id", async (req, res) => {
           try {
               const data = await this.#databaseHelper.handleQuery({
                   query: "SELECT last_answered FROM user_survey WHERE user_survey.survey_id = ? AND user_survey.user_id = ?;",
                   values: [req.params.survey_id, req.params.user_id]
               });

               res.status(this.#errorCodes.HTTP_OK_CODE).json(data);
           } catch (e) {
               res.status(this.#errorCodes.BAD_REQUEST_CODE).json({reason: e});
           }
        });
    }

    /**
     * Update the last answered question number.
     *
     * @route {POST} /intake/last_answered/update
     * @author Tim Knops
     */
    #updateLastAnsweredQuestion() {
        this.#app.post("/intake/last_answered/update", async (req, res) => {
            try {
                const data = await this.#databaseHelper.handleQuery({
                    query: "UPDATE user_survey SET last_answered = ? WHERE user_survey.survey_id = ? AND user_survey.user_id = ?;",
                    values: [req.body.last_answered, req.body.survey_id, req.body.user_id]
                });

                res.status(this.#errorCodes.HTTP_OK_CODE).json(data);
            } catch (e) {
                res.status(this.#errorCodes.BAD_REQUEST_CODE).json({reason: e});
            }
        })
    }

    /**
     * Get the total amount of questions that is in the survey.
     *
     * @route {GET} /intake/question/survey/:survey_id/amount
     * @author Tim Knops
     */
    #getTotalAmountOfQuestions() {
        this.#app.get("/intake/question/survey/:survey_id/amount", async (req, res) => {
            try {
                const data = await this.#databaseHelper.handleQuery({
                    query: "SELECT COUNT(*) AS questions_in_survey FROM question WHERE survey_id = ?;",
                    values: [req.params.survey_id]
                });

                res.status(this.#errorCodes.HTTP_OK_CODE).json(data);
            } catch (e) {
                res.status(this.#errorCodes.BAD_REQUEST_CODE).json({reason: e});
            }
        })
    }
}

module.exports = QuestionMovementRoutes;