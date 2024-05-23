/**
 * All routes related to the activities.
 *
 * @author Tim Knops
 */
class ActivitiesRoutes {
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

        this.#getActivities();
        this.#saveChosenActivities();
        this.#getChosenRecommendations();
    }

    /**
     * Gets all the activities depending on the recommendations chosen.
     *
     * @route {GET} /activities/:bone_recommendation/:muscle_recommendation/:balance_recommendation
     * @author Tim Knops
     */
    #getActivities() {
        this.#app.get("/activities/:bone_recommendation/:muscle_recommendation/:balance_recommendation", async (req, res) => {
            try {
                const data = await this.#databaseHelper.handleQuery({
                    query: "SELECT activity_name, \n" +
                        "       activity.bone, \n" +
                        "       activity.muscle, \n" +
                        "       activity.balance \n" +
                        "FROM activity \n" +
                        "WHERE \n" +
                        "    activity.bone = ? OR activity.muscle = ? OR activity.balance = ? \n" +
                        "ORDER BY activity.order;",
                    values: [req.params.bone_recommendation, req.params.muscle_recommendation, req.params.balance_recommendation]
                });

                res.status(this.#errorCodes.HTTP_OK_CODE).json(data);
            } catch (e) {
                res.status(this.#errorCodes.BAD_REQUEST_CODE).json({reason: e});
            }
        });
    }

    /**
     * Saves the activities that the user has chosen
     *
     * @route {POST} /activities/save
     * @author Tim Knops
     */
    #saveChosenActivities() {
        this.#app.post("/activities/save", async (req, res) => {
            try {
                const chosenActivities = req.body.chosenActivities;
                let data;

                data = await this.#databaseHelper.handleQuery({
                    query: "DELETE FROM user_activity WHERE user_id = ?;",
                    values: [req.body.user_id]
                });

                for (let i = 0; i < chosenActivities.length; i++) {
                    data = await this.#databaseHelper.handleQuery({
                        query: "INSERT INTO user_activity(activity_name, user_id) VALUES (?, ?);",
                        values: [chosenActivities[i], req.body.user_id]
                    });
                }

                res.status(this.#errorCodes.HTTP_OK_CODE).json(data);
            } catch (e) {
                res.status(this.#errorCodes.BAD_REQUEST_CODE).json({reason: e});
            }
        });
    }

    /**
     * Route for getting the chosen recommendations.
     *
     * @route {GET} /activities/chosen_recommendations/:user_id
     * @author Tim Knops
     */
    #getChosenRecommendations() {
        this.#app.get("/activities/chosen_recommendations/:user_id", async (req, res) => {
           try {
               const data = await this.#databaseHelper.handleQuery({
                   query: "SELECT \n" +
                       "    recommendation.muscle,\n" +
                       "    recommendation.cardio AS bone,\n" +
                       "    recommendation.balance\n" +
                       "FROM \n" +
                       "    recommendation\n" +
                       "WHERE \n" +
                       "    recommendation.user_id = ?\n" +
                       ";",
                   values: [req.params.user_id]
               });

               res.status(this.#errorCodes.HTTP_OK_CODE).json(data);
           } catch (e) {
               res.status(this.#errorCodes.BAD_REQUEST_CODE).json({reason: e});
           }
        });
    }
}

module.exports = ActivitiesRoutes;