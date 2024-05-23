/**
 * Routes for account entity
 * @author Sara Benali
 *
 */

class AccountRoutes{
    #app;
    #databaseHelper = require ("../framework/utils/databaseHelper");
    #httpErrorCode = require ("../framework/utils/httpErrorCodes");
    #cryptoHelper = require ("../framework/utils/cryptoHelper");

    /**
     * constructor
     * @param app
     * @author Sara Benali
     */
    constructor(app) {
        this.#app = app;

        this.#account();
        this.#addRouteRelation();
    }

    /**
     * {POST} route for account
     * query to enter user information in the database
     * @author Sara Benali
     *
     */
    #account(){
        this.#app.post("/account", async (req, res) => {
            try{
                const data = await this.#databaseHelper.handleQuery({
                    query: "INSERT INTO user(first_name, last_name, username, email, password) VALUES(?, ?, ?, ?, ?)",
                    values: [req.body.firstName, req.body.lastName, req.body.username, req.body.email,
                        this.#cryptoHelper.getHashedPassword(req.body.password)]
                });
                if (data.insertId){
                    res.status(this.#httpErrorCode.HTTP_OK_CODE).json({user_id: data.insertId});
                }
            }catch (e){
                res.status(this.#httpErrorCode.BAD_REQUEST_CODE).json({reason: e})
            }
        })
    }

    /**
     * Adding the proper survey - account relation.
     *
     * @route
     * @author Tim Knops
     */
    #addRouteRelation() {
        this.#app.post("/account/add/survey", async (req, res) => {
           try {
               const data = await this.#databaseHelper.handleQuery({
                   query: "INSERT INTO user_survey(user_id, survey_id, last_answered) VALUES (?, ?, ?);",
                   values: [req.body.user_id, req.body.survey_id, req.body.last_answered]
               });

               res.status(this.#httpErrorCode.HTTP_OK_CODE).json(data);
           } catch (e) {
               res.status(this.#httpErrorCode.BAD_REQUEST_CODE).json({reason: e});
           }
        });
    }
}

module.exports = AccountRoutes;