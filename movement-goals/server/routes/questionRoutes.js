/**
 * All routes related to the question switch controller.
 *
 * @author Tim Knops
 */
class QuestionRoutes {
    #app;
    #errorCodes = require("../framework/utils/httpErrorCodes.js");
    #databaseHelper = require("../framework/utils/databaseHelper.js");

    /**
     * Constructor
     *
     * @param app  server application
     * @author Tim Knops
     */
    constructor(app) {
        this.#app = app;

        this.#getQuestionType();
    }

    /**
     * Gets the question type of the question.
     *
     * @route {GET} /question/type/:question_order
     * @author Tim Knops
     */
    #getQuestionType() {
        this.#app.get("/question/type/:survey_id/:question_order", async (req, res) => {
           try {
               const data = await this.#databaseHelper.handleQuery({
                   query: "SELECT question.question_type_id FROM question WHERE question.order = ? AND question.survey_id = ?;",
                   values: [req.params.question_order, req.params.survey_id]
               });

               res.status(this.#errorCodes.HTTP_OK_CODE).json(data);
           } catch (e) {
               res.status(this.#errorCodes.BAD_REQUEST_CODE).json({reason: e});
           }
        });
    }
}

module.exports = QuestionRoutes;