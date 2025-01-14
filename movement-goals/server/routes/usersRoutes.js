/**
 * This class contains ExpressJS routes specific for the users entity
 * this file is automatically loaded in app.js
 *
 * @author Pim Meijer
 */
class UsersRoutes {
    #errorCodes = require("../framework/utils/httpErrorCodes")
    #databaseHelper = require("../framework/utils/databaseHelper")
    #cryptoHelper = require("../framework/utils/cryptoHelper");
    #app

    /**
     * @param app - ExpressJS instance(web application) we get passed automatically via app.js
     * Important: always make sure there is an app parameter in your constructor!
     */
    constructor(app) {
        this.#app = app;

        //call method per route for the users entity
        this.#login()
        this.#getUserId();
    }

    /**
     * Checks if passed username and password are found in db, if so let the front-end know
     * @private
     */
    #login() {
        this.#app.post("/users/login", async (req, res) => {
            const username = req.body.username;
            const password = req.body.password;

            try {
                const data = await this.#databaseHelper.handleQuery({
                    query: "SELECT username, password FROM user WHERE username = ? AND password = ?;",
                    values: [username, this.#cryptoHelper.getHashedPassword(password)]
                });

                //if we found one record we know the user exists in users table
                if (data.length === 1) {
                    //return just the username for now, never send password back!
                    res.status(this.#errorCodes.HTTP_OK_CODE).json({"username": data[0].username});
                } else {
                    //wrong username
                    res.status(this.#errorCodes.AUTHORIZATION_ERROR_CODE).json({reason: "Wrong username or password"});
                }
            } catch (e) {
                res.status(this.#errorCodes.BAD_REQUEST_CODE).json({reason: e});
            }
        });
    }

    /**
     * Gets the user_id.
     *
     * @author Tim Knops
     */
    #getUserId() {
        this.#app.get("/users/login/:username", async (req, res) => {
           try {
               const data = await this.#databaseHelper.handleQuery({
                   query: "SELECT user_id FROM user WHERE username = ?;",
                   values: [req.params.username]
               });

               res.status(this.#errorCodes.HTTP_OK_CODE).json(data);
           } catch (e) {
               res.status(this.#errorCodes.BAD_REQUEST_CODE).json({reason: e});
           }
        });
    }
}

module.exports = UsersRoutes