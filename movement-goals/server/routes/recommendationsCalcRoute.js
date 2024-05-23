/**
 * Routes file to get the answers of the intake and calculate recommendation
 * @author Sara Benali
 */

class RecommendationRoutes{
    #app;
    #databaseHelper = require("../framework/utils/databaseHelper");
    #httpErrorCodes = require("../framework/utils/httpErrorCodes");

    constructor(app) {
        this.#app = app;
        this.#getIntakeAnswers();
        this.#getActivitiesBone();
        this.#getActivitiesMuscle();
        this.#getActivitiesBalance();
    }


    /**
     * @async allows program to run a function without freezing the program
     * get request to request answers of intake from the database
     * query to get answers of the intake in the database
     * @author Sara Benali
     */

    #getIntakeAnswers() {
        this.#app.get("/recommendations/:question_id/calculations/:survey_id/:user_id", async (req, res) => {
            try {
                const data = await this.#databaseHelper.handleQuery({
                    query: "SELECT * FROM answer WHERE question_id = ? AND survey_id = ? AND user_id = ?;",
                    values: [req.params.question_id, req.params.survey_id, req.params.user_id]
                });

                res.status(this.#httpErrorCodes.HTTP_OK_CODE).json(data);
            } catch (e) {
                res.status(this.#httpErrorCodes.BAD_REQUEST_CODE).json({reason: e});
            }
        });
    }


    /**
     * @async allows program to run a function without freezing the program
     * get request to request activities from the database
     * query to get activities of the bone for the recommendations from the database
     * @author Sara Benali
     */
    #getActivitiesBone(){
        this.#app.get("/recommendations/bone/:bone", async (req, res) => {
            try{
                const data = await this.#databaseHelper.handleQuery({
                    query: "SELECT activity_name FROM activity WHERE bone = ?;",
                    values: [req.params.bone]
                });
                res.status(this.#httpErrorCodes.HTTP_OK_CODE).json(data);
            }catch (e){
                res.status(this.#httpErrorCodes.BAD_REQUEST_CODE).json({reason: e});
            }
        })
    }

    /**
     * @async allows program to run a function without freezing the program
     * get request to request activities from the database
     * query to get activities of the muscle for the recommendations from the database
     * @author Sara Benali
     */

    #getActivitiesMuscle(){
        this.#app.get("/recommendations/muscle/:muscle", async (req, res) => {
            try{
                const data = await this.#databaseHelper.handleQuery({
                    query: "SELECT activity_name FROM activity WHERE muscle = ?;",
                    values: [req.params.muscle]
                });
                res.status(this.#httpErrorCodes.HTTP_OK_CODE).json(data);
            }catch (e){
                res.status(this.#httpErrorCodes.BAD_REQUEST_CODE).json({reason: e});
            }
        })
    }

    /**
     * @async allows program to run a function without freezing the program
     * get request to request activities from the database
     * query to get activities of the balance for the recommendations from the database
     * @author Sara Benali
     */
    #getActivitiesBalance(){
        this.#app.get("/recommendations/balance/:balance", async (req, res) => {
            try{
                const data = await this.#databaseHelper.handleQuery({
                    query: "SELECT activity_name FROM activity WHERE balance = ?;",
                    values: [req.params.balance]
                });
                res.status(this.#httpErrorCodes.HTTP_OK_CODE).json(data);
            }catch (e){
                res.status(this.#httpErrorCodes.BAD_REQUEST_CODE).json({reason: e});
            }
        })
    }
}

module.exports = RecommendationRoutes;