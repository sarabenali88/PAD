/**
 * All routes for the calendar.
 *
 * @author Tim Knops
 */
class CalendarRoutes {
    #app;
    #errorCodes = require("../framework/utils/httpErrorCodes.js");
    #databaseHelper = require("../framework/utils/databaseHelper.js");

    constructor(app) {
        this.#app = app;

        this.#getAllEvents();
        this.#saveAllEvents();
        this.#getChosenActivities();
    }

    /**
     * Gets all the events of the user.
     *
     * @route {GET} /calendar/events/:user_id
     * @author Tim Knops
     */
    #getAllEvents() {
        this.#app.get("/calendar/events/:user_id", async (req, res) => {
           try {
               const data = await this.#databaseHelper.handleQuery({
                  query:  "SELECT\n" +
                          "    calendar_event.title,\n" +
                          "    calendar_event.start,\n" +
                          "    calendar_event.end,\n" +
                          "    calendar_event.is_custom_title AS custom\n" +
                      "FROM\n" +
                          "    calendar_event\n" +
                          "WHERE\n" +
                          "    user_id = ?\n" +
                          ";",
                  values: [req.params.user_id]
               });

               res.status(this.#errorCodes.HTTP_OK_CODE).json(data);
           } catch (e) {
               res.status(this.#errorCodes.BAD_REQUEST_CODE).json({reason: e});
           }
        });
    }

    /**
     * Inserts all events into the database.
     *
     * @route {POST} /calendar/events/save
     * @author Tim Knops
     */
    #saveAllEvents() {
        this.#app.post("/calendar/events/save", async (req, res) => {
           try {
               const events = req.body.eventsArr;
               let data;

               data = await this.#databaseHelper.handleQuery({
                   query: "DELETE FROM calendar_event WHERE user_id = ?;",
                   values: [req.body.user_id]
               });

               for (let i = 0; i < events.length; i++) {
                   data = await this.#databaseHelper.handleQuery({
                       query: "INSERT INTO calendar_event(user_id, title, start, end, is_custom_title) VALUES (?, ?, ?, ?, ?);",
                       values: [req.body.user_id, events[i].title, events[i].start, events[i].end, events[i].extendedProps.custom]
                   });
               }

               res.status(this.#errorCodes.HTTP_OK_CODE).json(data);
           } catch (e) {
               res.status(this.#errorCodes.BAD_REQUEST_CODE).json({reason: e});
           }
        });
    }

    /**
     * Get all the chosen user activities.
     *
     * @route {GET} /calendar/activities/:user_id
     * @author Tim Knops
     */
    #getChosenActivities() {
        this.#app.get("/calendar/activities/:user_id", async (req, res) => {
            try {
                const data = await this.#databaseHelper.handleQuery({
                   query:  `SELECT
                                user_activity.activity_name
                            FROM
                                user_activity
                            WHERE
                                user_id = ?
                            ;`,
                    values: [req.params.user_id]
                });

                res.status(this.#errorCodes.HTTP_OK_CODE).json(data);
            } catch (e) {
                res.status(this.#errorCodes.BAD_REQUEST_CODE).json({reason: e});
            }
        });
    }
}

module.exports = CalendarRoutes;