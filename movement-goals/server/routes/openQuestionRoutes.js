/**
 *
 *Routes file for open question entity
 * @author Sara Benali
 *
 */


class QuestionRoutes {
    #app;
    #databaseHelper = require("../framework/utils/databaseHelper");
    #httpErrorCodes = require("../framework/utils/httpErrorCodes");

    constructor(app) {
        this.#app = app;
        this.#getQuestion();
        this.#getTitle();
    }

    /**
     * @async allows program to run a function without freezing the program
     * get request to request title of question from the database
     * query to get title of the question in the database
     *
     */
    #getQuestion() {
        this.#app.get("/intake/movement/question/:question_movement_id", async (req, res) => {
            try {
                const data = await this.#databaseHelper.handleQuery({
                    query: "SELECT\n" +
                        "text\n" +
                        "FROM\n " +
                        "question_movement \n" +
                        "WHERE \n" +
                        "question_movement_id = ?;\n",
                    values: [req.params.question_movement_id]
                });
                res.status(this.#httpErrorCodes.HTTP_OK_CODE).json(data);

            } catch (e) {
                res.status(this.#httpErrorCodes.BAD_REQUEST_CODE).json({reason: e})
            }
        })
    }

    /**
     * @async allows program to run a function without freezing the program
     * A get request to receive data from the database
     * Query to select the title from the table 'question'
     *
     */

    #getTitle() {
        this.#app.get("/intake/movement/:question_id", async (req, res) => {
            try {
                const data = await this.#databaseHelper.handleQuery({
                    query: "SELECT\n" +
                        "title\n" +
                        "FROM\n " +
                        "question \n" +
                        " WHERE \n" +
                        "question_id = ?;\n",
                    values: [req.params.question_id]
                });
                res.status(this.#httpErrorCodes.HTTP_OK_CODE).json(data);

            } catch (e) {
                res.status(this.#httpErrorCodes.BAD_REQUEST_CODE).json({reason: e})
            }
        })
    }

}

module.exports = QuestionRoutes;