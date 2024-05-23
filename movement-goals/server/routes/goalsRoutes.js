/**
 * route for goals entity
 * @author Sara Benali
 *
 */

class goalsRoutes {
    #app;
    #databaseHelper = require("../framework/utils/databaseHelper.js");
    #errorCodes = require("../framework/utils/httpErrorCodes.js");


    /**
     * constructor
     * @param app
     * @author Sara Benali
     */
    constructor(app) {
        this.#app = app;
        this.#getUserActivities();
        this.#insertGoals();
    }

    /**
     * gets all the activities chosen by the user
     * @route {GET} /goals/activities/:user_id
     * @author Sara Benali
     */
    #getUserActivities() {
        this.#app.get("/goals/activities/:user_id", async (req, res) => {
            try {
                const data = await this.#databaseHelper.handleQuery({
                    query: "SELECT activity_name FROM user_activity WHERE user_id = ?;",
                    values: [req.params.user_id]
                });

                res.status(this.#errorCodes.HTTP_OK_CODE).json(data);
            } catch (e) {
                res.status(this.#errorCodes.BAD_REQUEST_CODE).json({reason: e});
            }
        });
    }

    /**
     * inserts the goals for the chosen activities by the user
     * @route {POST} /goals/activities
     * @author Sara Benali
     */
    #insertGoals(){
        this.#app.post("/goals/activities", async (req, res) => {
            try {
                const data = await this.#databaseHelper.handleQuery({
                    query: "INSERT INTO goal(user_id, activity_name, days_per_week, time_per_day) VALUES(?, ?, ?, ?);",
                    values: [req.body.user_id, req.body.activity_name, req.body.days_per_week, req.body.time_per_day]
                });

                res.status(this.#errorCodes.HTTP_OK_CODE).json(data);
            } catch (e) {
                res.status(this.#errorCodes.BAD_REQUEST_CODE).json({reason: e});
            }
        });
    }
}
module.exports = goalsRoutes;