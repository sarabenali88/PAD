class DashboardRoutes {
    #app;
    #databaseHelper = require("../framework/utils/databaseHelper");
    #httpErrorCodes = require("../framework/utils/httpErrorCodes");

    constructor(app) {
        this.#app = app;

        this.#getTotalAmountOfActivities();
        this.#getActivityNames();
        this.#getGoalsPerWeek();
        this.#updateDaysDone();
        this.#getDaysDone();
        this.#deleteGoal();
    }

    /**
     * Get the total amount of chosen activities chosen by the user_id
     *
     * @route {GET} /dashboard/:user_id/check
     * @author Kaifie Dil.
     */
    #getTotalAmountOfActivities() {
        this.#app.get("/dashboard/:user_id/check", async (req, res) => {
            try {
                const data = await this.#databaseHelper.handleQuery({
                    query: "SELECT COUNT(*) AS chosen_activities FROM user_activity WHERE user_id = ?;",
                    values: [req.params.user_id]
                });
                res.status(this.#httpErrorCodes.HTTP_OK_CODE).json(data);
            } catch (e) {
                res.status(this.#httpErrorCodes.BAD_REQUEST_CODE).json({reason: e});
            }
            console.log("hallo")
        })
    }

    /**
     * Get the names of the activities chosen by the user_id
     *
     * @route {GET} /dashboard/:user_id/name
     * @author Kaifie Dil.
     */
    #getActivityNames() {
        this.#app.get("/dashboard/:user_id/name", async (req, res) => {
            try {
                const data = await this.#databaseHelper.handleQuery({
                    query: "SELECT activity_name FROM user_activity WHERE user_id = ?;",
                    values: [req.params.user_id]
                });
                res.status(this.#httpErrorCodes.HTTP_OK_CODE).json(data);
            } catch (e) {
                res.status(this.#httpErrorCodes.BAD_REQUEST_CODE).json({reason: e});
            }
        });
    }

    /**
     * Get the days per week that an activity should be done
     *
     * @route {GET} /dashboard/:user_id/perweek
     * @author Kaifie Dil.
     */
    #getGoalsPerWeek() {
        this.#app.get("/dashboard/:user_id/perweek", async (req, res) => {
            try {
                const data = await this.#databaseHelper.handleQuery({
                    query: "SELECT days_per_week, activity_name FROM goal WHERE user_id = ?;",
                    values: [req.params.user_id]
                });
                res.status(this.#httpErrorCodes.HTTP_OK_CODE).json(data);
            } catch (e) {
                res.status(this.#httpErrorCodes.BAD_REQUEST_CODE).json({reason: e});
            }
        });
    }

    /**
     * Send an update query to the endpoint, then update the data from the repository into the database
     *
     * @route {POST} /dashboard/:user_id/daysdone
     * @author Kaifie Dil.
     */
    #updateDaysDone() {
        this.#app.post("/dashboard/:user_id/daysdone", async (req, res) => {
            try {
                const data = await this.#databaseHelper.handleQuery({
                    query: "UPDATE `goal` SET `days_done` = ? WHERE `user_id` = ? AND `activity_name` = ?",
                    values: [req.body.days_done, req.body.user_id, req.body.activity_name]
                });
                res.status(this.#httpErrorCodes.HTTP_OK_CODE).json(data);
            } catch (e) {
                res.status(this.#httpErrorCodes.BAD_REQUEST_CODE).json({reason: e});
            }
        })
    }

    /**
     * Get the days per week that an activity should be done
     *
     * @route {GET} /dashboard/:user_id/getdaysdone
     * @author Kaifie Dil.
     */
    #getDaysDone() {
        this.#app.get("/dashboard/:user_id/getdaysdone", async (req, res) => {
            try {
                const data = await this.#databaseHelper.handleQuery({
                    query: "SELECT `days_done`, `activity_name` FROM `goal` WHERE `user_id` = ?",
                    values: [req.params.user_id]
                });
                res.status(this.#httpErrorCodes.HTTP_OK_CODE).json(data);
            } catch (e) {
                res.status(this.#httpErrorCodes.BAD_REQUEST_CODE).json({reason: e});
            }
        })
    }

    /**
     * Delete the chosen goal from both the user_activity table and goal table
     *
     * @route {POST} /dashboard/:user_id/deletegoal
     * @author Kaifie Dil.
     */
    #deleteGoal() {
        this.#app.post("/dashboard/:user_id/deletegoal", async (req, res) => {
            try {
                const data = await this.#databaseHelper.handleQuery({
                    query: "DELETE FROM `goal` WHERE `user_id` = ? AND `activity_name` = ?",
                    values: [req.body.user_id, req.body.activity_name]
                });
                const dataActivity = await this.#databaseHelper.handleQuery({
                    query: "DELETE FROM `user_activity` WHERE `user_id` = ? AND `activity_name` = ?",
                    values: [req.body.user_id, req.body.activity_name]
                });
                res.status(this.#httpErrorCodes.HTTP_OK_CODE).json({ goalData: data, activityData: dataActivity });
            } catch (e) {
                res.status(this.#httpErrorCodes.BAD_REQUEST_CODE).json({reason: e});
            }
        })
    }
}

module.exports = DashboardRoutes;