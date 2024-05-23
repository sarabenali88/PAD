/**
 * Routes file for recommendation entity
 * @author Kaifie Dil.
 */

class RecommendationRoutes {
    #app;
    #databaseHelper = require("../framework/utils/databaseHelper")
    #httpErrorCodes = require("../framework/utils/httpErrorCodes")

    // Starts the routes file, starts the three route functions
    constructor(app) {
        this.#app = app;

        this.#checkRecommendation();
        this.#saveRecommendation();
        this.#updateRecommendation();
    }

    /**
     * Sent an insert query to the endpoint, then insert the data from the repository into the database
     * @author Kaifie Dil.
     */
    #saveRecommendation() {
        this.#app.post("/recommendations/save", async (req, res) => {
            try {
                const data = await this.#databaseHelper.handleQuery({
                    query: "INSERT INTO `recommendation` (`user_id`, `muscle`, `cardio`, `balance`) VALUES (?, ?, ?, ?)",
                    values: [req.body.user_id, req.body.muscle, req.body.cardio, req.body.balance]
                });
                res.status(this.#httpErrorCodes.HTTP_OK_CODE).json(data);
            } catch (e) {
                res.status(this.#httpErrorCodes.BAD_REQUEST_CODE).json("ERROR")
            }
        })
    }

    /**
     * Send an update query to the endpoint, then update the data from the repository into the database
     * @author Kaifie Dil.
     */
    #updateRecommendation() {
        this.#app.post("/recommendations/update", async (req, res) => {
            try {
                const data = await this.#databaseHelper.handleQuery({
                    query: "UPDATE `recommendation` SET `muscle` = ?, `cardio` = ?, `balance` = ? WHERE `user_id` = ?",
                    values: [req.body.muscle, req.body.cardio, req.body.balance, req.body.user_id]
                });

                res.status(this.#httpErrorCodes.HTTP_OK_CODE).json(data);
            } catch (e) {
                res.status(this.#httpErrorCodes.BAD_REQUEST_CODE).json("ERROR")
            }
        })
    }

    /**
     * Send a get query to the endpoint, then select data from the database if it is the same as the value given
     * @author Kaifie Dil.
     */
    #checkRecommendation() {
        this.#app.get("/recommendations/check/:user_id", async (req, res) => {
            try {
                const data = await this.#databaseHelper.handleQuery({
                    query: "SELECT `user_id` FROM `recommendation` WHERE `user_id` = ?",
                    values: [req.params.user_id]
                });
                res.status(this.#httpErrorCodes.HTTP_OK_CODE).json(data);
            } catch (e) {
                res.status(this.#httpErrorCodes.BAD_REQUEST_CODE).json("ERROR")
            }
        })
    }
}

module.exports = RecommendationRoutes;