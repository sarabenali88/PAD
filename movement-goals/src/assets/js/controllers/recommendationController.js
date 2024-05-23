/**
 * Controller for recommendation screen and user interaction
 * @author Kaifie Dil.
 */
import {Controller} from "./controller.js";
import {RecommendationRepository} from "../repositories/recommendationRepository.js";
import {App} from "../app.js";

export class RecommendationController extends Controller {
    #recommendationView;
    #recommendationRepository;
    #survey_id;
    #userId;
    #moderateMovementRec;
    #boneExerciseRec;
    #muscleExerciseRec;
    #balanceExerciseRec;
    #question1;
    #question2;
    #question4;
    #question6;
    #question7;
    #question8;
    #bone;
    #muscle;
    #balance;

    static boneExerciseRecommendation = [];
    static muscleExerciseRecommendation = [];
    static balanceExerciseRecommendation = [];
    static MAX_MOVEMENT_RECOMMENDATION = 150;
    static MAX_BONE_RECOMMENDATION = 2;
    static MAX_MUSCLE_RECOMMENDATION = 2;
    static MAX_BALANCE_RECOMMENDATION = 2;

    constructor() {
        super();
        this.#recommendationRepository = new RecommendationRepository();
        this.#survey_id = 1;
        this.#userId = App.sessionManager.get("user_id");
        this.#moderateMovementRec = 0;
        this.#boneExerciseRec = 0;
        this.#muscleExerciseRec = 0;
        this.#balanceExerciseRec = 0;
        this.#question1 = 1;
        this.#question2 = 2;
        this.#question4 = 4;
        this.#question6 = 6;
        this.#question7 = 7;
        this.#question8 = 8;
        this.#bone = 1;
        this.#muscle = 1;
        this.#balance = 1;
        this.#setUp();
        this.#setupView();
    }

    /**
     * This function sets up the view, by inserting the view into the index.html, then starts an event listener for when
     * the button is pressed so it can save the chosen recommendation and it implements the drop function
     *
     * @author Kaifie Dil
     * @returns {Promise<void>}
     */
    async #setupView() {
        this.#recommendationView = await super.loadHtmlIntoContent("html_views/recommendations.html")

        this.#recommendationView.querySelector(".btn").addEventListener("click", (event) => this.#saveRecommendation(event));

        this.#drop();
    }

    /**
     * method for html file--- only used to check things in the console
     * method for invoking other methods
     * @return {Promise<void>}
     * @auhtor Sara Benali
     */
    async #setUp() {
        await this.#firstQuestion(this.#question1, this.#survey_id, this.#userId);
        await this.#secondQuestion(this.#question2, this.#survey_id, this.#userId);
        await this.#thirdQuestion(this.#question6, this.#survey_id, this.#userId);
        await this.#fourthQuestion(this.#question7, this.#survey_id, this.#userId);
        await this.#activitiesBone(this.#bone);
        await this.#activitiesMuscle(this.#muscle);
        await this.#activitiesBalance(this.#balance);
        await this.#fifthQuestion(this.#question8, this.#survey_id, this.#userId);
        await this.#sixthQuestion(this.#question4, this.#survey_id, this.#userId);
        await this.#checkRecommendation();
    }

    /**
     *
     * @param question_id
     * @param survey_id
     * @param user_id
     * @return {Promise<void>}
     * method to split answers and work on recommendation
     * @author Sara Benali
     */
    async #firstQuestion(question_id, survey_id, user_id) {
        const question1 = await this.#recommendationRepository.getIntakeAnswers(question_id, survey_id, user_id);
        const fail = question1[0].text;
        if (fail === "[Niet van toepassing]") {
            this.#moderateMovementRec += 0;
        } else {
            const splitAnswer1 = question1[0].text.split("] [");
            let timePerDay1, timePerDay2;
            splitAnswer1.forEach((block, index) => {
                const parts = block
                    .replace("[", "")
                    .replace("]", "")
                    .split(", ")
                    .map((part) => part.split(": ")[1]);
                if (index === 0) {
                    timePerDay1 = parts[1];
                } else if (index === 1) {
                    timePerDay2 = parts[1];
                }

            })
            const time1InMin = parseInt(timePerDay1.split(" uur")[0]) * 60 + parseInt(timePerDay1.split(" ")[2]);
            const time2InMin = parseInt(timePerDay2.split(" uur")[0]) * 60 + parseInt(timePerDay2.split(" ")[2]);

            if (time1InMin !== 0) {
                this.#moderateMovementRec += time1InMin;
            }
            if (time2InMin !== 0) {
                this.#moderateMovementRec += time2InMin;
            }
        }
    }

    /**
     *
     * @param question_id
     * @param survey_id
     * @param user_id
     * @return {Promise<void>}
     * method to split answers and work on recommendation
     * @author Sara Benali
     */
    async #secondQuestion(question_id, survey_id, user_id) {
        const question2 = await this.#recommendationRepository.getIntakeAnswers(question_id, survey_id, user_id);
        const fail = question2[0].text;
        if (fail === "[Niet van toepassing]") {
            this.#moderateMovementRec += 0;
        } else {
            const splitAnswer2 = question2[0].text.split("] [");
            let timesPerDay1, timesPerDay2;
            splitAnswer2.forEach((block, index) => {
                const splitting = block
                    .replace("[", "")
                    .replace("]", "")
                    .split(", ")
                    .map((part) => part.split(": ")[1]);
                if (index === 0) {
                    timesPerDay1 = splitting[0];
                } else if (index === 1) {
                    timesPerDay2 = splitting[0];
                }
            })

            const times1InMin = parseInt(timesPerDay1.split(" uur")[0]) * 60 + parseInt(timesPerDay1.split(" ")[2]);
            const times2InMin = parseInt(timesPerDay2.split(" uur")[0]) * 60 + parseInt(timesPerDay2.split(" ")[2]);

            if (times1InMin !== 0) {
                this.#moderateMovementRec += times1InMin;
            }
            if (times2InMin !== 0) {
                this.#moderateMovementRec += times2InMin;
            }
        }

    }

    /**
     *
     * @param question_id
     * @param survey_id
     * @param user_id
     * @return {Promise<void>}
     * method to split answers and work on recommendation
     * @author Sara Benali
     */

    async #thirdQuestion(question_id, survey_id, user_id) {
        const question3 = await this.#recommendationRepository.getIntakeAnswers(question_id, survey_id, user_id);
        const fail = question3[0].text;
        if (fail === "[Niet van toepassing]") {
            this.#moderateMovementRec += 0;
        } else {
            const splitAnswer3 = question3[0].text.split("] [");
            let timePerDay1, timePerDay2;
            splitAnswer3.forEach((block, index) => {
                const parts = block
                    .replace("[", "")
                    .replace("]", "")
                    .split(", ")
                    .map((part) => part.split(": ")[1]);
                if (index === 0) {
                    timePerDay1 = parts[1];
                } else if (index === 1) {
                    timePerDay2 = parts[1];
                }
            })
            const time1InMinutes = parseInt(timePerDay1.split(" uur")[0]) * 60 + parseInt(timePerDay1.split(" ")[2]);
            const time2InMinutes = parseInt(timePerDay2.split(" uur")[0]) * 60 + parseInt(timePerDay2.split(" ")[2]);

            if (time1InMinutes !== 0) {
                this.#moderateMovementRec += time1InMinutes;
            }
            if (time2InMinutes !== 0) {
                this.#moderateMovementRec += time2InMinutes;
            }
        }

    }

    /**
     *
     * @param question_id
     * @param survey_id
     * @param user_id
     * @return {Promise<void>}
     * method to split answers and work on recommendation
     * @author Sara Benali
     */
    async #fourthQuestion(question_id, survey_id, user_id) {
        const question4 = await this.#recommendationRepository.getIntakeAnswers(question_id, survey_id, user_id);
        const fail = question4[0].text;
        if (fail === "[Niet van toepassing]") {
            this.#boneExerciseRec += 0;
            this.#muscleExerciseRec += 0;
            this.#balanceExerciseRec += 0;
        } else {
            const splitAnswer4 = question4[0].text.split("] [");
            let daysPerWeek1, daysPerWeek2, daysPerWeek3;
            splitAnswer4.forEach((block, index) => {
                const parting = block
                    .replace("[", "")
                    .replace("]", "")
                    .split(", ")
                    .map((part) => part.split(": ")[1]);
                if (index === 0) {
                    daysPerWeek1 = parseInt(parting[0]);
                } else if (index === 1) {
                    daysPerWeek2 = parseInt(parting[0]);
                } else if (index === 2) {
                    daysPerWeek3 = parseInt(parting[0]);
                }
            })
            if (daysPerWeek1 !== 0) {
                this.#boneExerciseRec += daysPerWeek1;
            }
            if (daysPerWeek2 !== 0) {
                this.#muscleExerciseRec += daysPerWeek2;
            }
            if (daysPerWeek3 !== 0) {
                this.#balanceExerciseRec += daysPerWeek2;
            }
        }
    }


    /**
     *
     * @param bone
     * @return {Promise<void>}
     * saving bone activities in bone array
     * @author Sara Benali
     */
    async #activitiesBone(bone){
        const activitiesBone = await this.#recommendationRepository.getActivitiesBone(bone);
        let activityArrays = JSON.stringify(activitiesBone, null, 4);
        activityArrays = JSON.parse(activityArrays);

        for (let i = 0; i < activityArrays.length; i++) {
            RecommendationController.boneExerciseRecommendation.push(activityArrays[i].activity_name);
        }
    }

    /**
     *
     * @param muscle
     * @return {Promise<void>}
     * saving muscle activities in muscle array
     * @auhtor Sara Benali
     */
    async #activitiesMuscle(muscle){
        const activitiesMuscle = await this.#recommendationRepository.getActivitiesMuscle(muscle);
        let activityArrays = JSON.stringify(activitiesMuscle, null, 4);
        activityArrays = JSON.parse(activityArrays);

        for (let i = 0; i < activityArrays.length; i++) {
            RecommendationController.muscleExerciseRecommendation.push(activityArrays[i].activity_name);
        }
    }

    /**
     *
     * @param balance
     * @return {Promise<void>}
     * saving balance activities in balance array
     * @author Sara Benali
     */

    async #activitiesBalance(balance){
        const activitiesBalance = await this.#recommendationRepository.getActivitiesBalance(balance);
        let activityArrays = JSON.stringify(activitiesBalance, null, 4);
        activityArrays = JSON.parse(activityArrays);

        for (let i = 0; i < activityArrays.length; i++) {
            RecommendationController.balanceExerciseRecommendation.push(activityArrays[i].activity_name);
        }
    }


    /**
     *
     * @param question_id
     * @param survey_id
     * @param user_id
     * @return {Promise<void>}
     * checking if sport equals to the right theme, if yes then add the days
     * @author Sara Benali
     */
    async #fifthQuestion(question_id, survey_id, user_id) {
        const question5 = await this.#recommendationRepository.getIntakeAnswers(question_id, survey_id, user_id);
        if (!question5[0].text.includes("(")) { // If there were no sports selected.
            return;
        }

        const splitAnswer5 = question5[0].text.split("] [");
        let daysPerWeek1, daysPerWeek2, daysPerWeek3, daysPerWeek4;
        let sport1, sport2, sport3, sport4;
        splitAnswer5.forEach((block, index) => {
            const parts = block
                .replace("[(", "")
                .replace("]", "")
                .replace("(", "")
                .replace(")", "")
                .split(", ")
                .map((part) => part.split(": "));
            if (index === 0) {
                sport1 = parts[0][0];
                daysPerWeek1 = parseInt(parts[1][1]);
            } else if (index === 1) {
                sport2 = parts[0][0]
                daysPerWeek2 = parseInt(parts[1][1]);
            } else if (index === 2) {
                sport3 = parts[0][0]
                daysPerWeek3 = parseInt(parts[1][1]);
            }else if (index === 3){
                sport4 = parts[0][0]
                daysPerWeek4 = parseInt(parts[1][1])
            }
        })

        for (let i = 0; i < RecommendationController.boneExerciseRecommendation.length; i++) {
            if (sport1 === RecommendationController.boneExerciseRecommendation[i]) {
                this.#boneExerciseRec += daysPerWeek1;
            }
            if (sport2 === RecommendationController.boneExerciseRecommendation[i]) {
                this.#boneExerciseRec += daysPerWeek2;
            }
            if (sport3 === RecommendationController.boneExerciseRecommendation[i]) {
                this.#boneExerciseRec += daysPerWeek3;
            }
            if (sport4 === RecommendationController.boneExerciseRecommendation[i]) {
                this.#boneExerciseRec += daysPerWeek4;
            }
        }
        for (let i = 0; i < RecommendationController.muscleExerciseRecommendation.length; i++) {
            if (sport1 === RecommendationController.muscleExerciseRecommendation[i]) {
                this.#muscleExerciseRec += daysPerWeek1;
            }
            if (sport2 === RecommendationController.muscleExerciseRecommendation[i]) {
                this.#muscleExerciseRec += daysPerWeek2;
            }
            if (sport3 === RecommendationController.muscleExerciseRecommendation[i]) {
                this.#muscleExerciseRec += daysPerWeek3;
            }
            if (sport4 === RecommendationController.muscleExerciseRecommendation[i]) {
                this.#muscleExerciseRec += daysPerWeek4;
            }
        }

        for (let i = 0; i < RecommendationController.balanceExerciseRecommendation.length; i++) {
            if (sport1 === RecommendationController.balanceExerciseRecommendation[i]) {
                this.#balanceExerciseRec += daysPerWeek1;
            }
            if (sport2 === RecommendationController.balanceExerciseRecommendation[i]) {
                this.#balanceExerciseRec += daysPerWeek2;
            }
            if (sport3 === RecommendationController.balanceExerciseRecommendation[i]) {
                this.#balanceExerciseRec += daysPerWeek3;
            }
            if (sport4 === RecommendationController.balanceExerciseRecommendation[i]) {
                this.#balanceExerciseRec += daysPerWeek4;
            }
        }
    }

    /**
     *
     * @param question_id
     * @param survey_id
     * @param user_id
     * @return {Promise<void>}
     * adding answer to all the themes
     * @author Sara Benali
     */

    async #sixthQuestion(question_id, survey_id, user_id) {
        const question6 = await this.#recommendationRepository.getIntakeAnswers(question_id, survey_id, user_id);
        const answer6 = parseInt(question6[0].text)
        if (answer6 !== 0) {
            this.#muscleExerciseRec += answer6;
        }
    }

    /**
     *
     * @return {Promise<void>}
     * Checking to see if user input is smaller than maximum, if yes than check and disable the box
     * @author Kaifie Dil
     */
    async #checkRecommendation() {
        let boneCheck = document.querySelector('#checkBone');
        let muscleCheck = document.querySelector('#checkMuscle');
        let balanceCheck = document.querySelector('#checkBalance');

        if (this.#boneExerciseRec < RecommendationController.MAX_BONE_RECOMMENDATION) {
            boneCheck.checked = true;

            this.#selectBone()
        }
        if (this.#muscleExerciseRec < RecommendationController.MAX_MUSCLE_RECOMMENDATION) {
            muscleCheck.checked = true;

            this.#selectMuscle()
        }
        if (this.#balanceExerciseRec < RecommendationController.MAX_BALANCE_RECOMMENDATION) {
            balanceCheck.checked = true;

            this.#selectBalance()
        }
        if (this.#moderateMovementRec < RecommendationController.MAX_MOVEMENT_RECOMMENDATION){
            boneCheck.checked = true;
            muscleCheck.checked = true;
            balanceCheck.checked = true;

            this.#selectBone()
            this.#selectMuscle()
            this.#selectBalance()
        }
    }

    /**
     *  This function makes sure the drag and drop system works, by searching for the icons and listening to when they
     *  are dragged or dropped, and replacing the location of the icon accordingly
     *
     * @author Kaifie Dil.
     */
    #selectMuscle() {
        const boxes = document.querySelectorAll(".box")
        const icon1 = document.getElementById("icon1")

        boxes.item(0).appendChild(icon1);
        boxes.item(0).classList.add("shadow-sm");
    }

    /**
     *  This function makes sure the drag and drop system works, by searching for the icons and listening to when they
     *  are dragged or dropped, and replacing the location of the icon accordingly
     *
     * @author Kaifie Dil.
     */
    #selectBone() {
        const boxes = document.querySelectorAll(".box")
        const icon2 = document.getElementById("icon2")

        boxes.item(1).appendChild(icon2)
        icon2.classList.remove("p-3")
        icon2.classList.add("justify-content-center", "ms-4")
        boxes.item(1).classList.add("shadow-sm");
    }

    /**
     *  This function makes sure the drag and drop system works, by searching for the icons and listening to when they
     *  are dragged or dropped, and replacing the location of the icon accordingly
     *
     * @author Kaifie Dil.
     */
    #selectBalance() {
        const boxes = document.querySelectorAll(".box")
        const icon3 = document.getElementById("icon3")

        boxes.item(2).appendChild(icon3)
        boxes.item(2).classList.add("shadow-sm");
    }

    /**
     *  This function makes sure the drag and drop system works, by searching for the icons and listening to when they
     *  are dragged or dropped, and replacing the location of the icon accordingly
     *
     * @author Kaifie Dil.
     */
    #unselectMuscle() {
        const boxes = document.querySelectorAll(".box")
        const iconMuscle = document.getElementById("icon1")
        const muscle = document.getElementById("muscle");

        boxes.forEach((box) => {
            if (box.hasChildNodes(iconMuscle)) {
                muscle.appendChild(iconMuscle);
                box.classList.remove("hovered", "shadow-sm");
            } else {
                iconMuscle.classList.remove("justify-content-center");
            }
        })
    }

    /**
     *  This function makes sure the drag and drop system works, by searching for the icons and listening to when they
     *  are dragged or dropped, and replacing the location of the icon accordingly
     *
     * @author Kaifie Dil.
     */
    #unselectBone() {
        const boxes = document.querySelectorAll(".box")
        const bone = document.getElementById("bone");
        const icon2 = document.getElementById("icon2")

        boxes.forEach((box) => {
            if (box.hasChildNodes(icon2)) {
                bone.append(icon2);
                icon2.classList.add("p-3");
                icon2.classList.remove("justify-content-center", "ms-4");
                box.classList.remove("hovered", "shadow-sm");
            }
        })
    }

    #unselectBalance() {
        const boxes = document.querySelectorAll(".box")
        const balance = document.getElementById("balance");
        const icon3 = document.getElementById("icon3")

        boxes.forEach((box) => {
            if (box.hasChildNodes(icon3)) {
                balance.append(icon3);
                box.classList.remove("hovered", "shadow-sm");
            }
        })
    }

    /**
     *  This function makes sure the drag and drop system works, by searching for the icons and listening to when they
     *  are dragged or dropped, and replacing the location of the icon accordingly
     *
     * @author Kaifie Dil.
     */
    #drop() {
        // Search for all the boxes and icons in the html
        const boxes = document.querySelectorAll(".box")

        const icon1 = document.getElementById("icon1")
        const icon2 = document.getElementById("icon2")
        const icon3 = document.getElementById("icon3")

        const checkMuscle = document.getElementById("checkMuscle");
        const checkBone = document.getElementById("checkBone");
        const checkBalance = document.getElementById("checkBalance");

        let chosenIcon = 0;

        // Listens to when a check is cliked and if its checked add the icon to the box, do the reverse if unchecked
        checkMuscle.addEventListener("change", () => {
            if (checkMuscle.checked) {
                this.#selectMuscle()
            } else {
                this.#unselectMuscle()
            }
        })

        // Listens to when a check is cliked and if its checked add the icon to the box, do the reverse if unchecked
        checkBone.addEventListener("change", () => {
            if (checkBone.checked) {
                this.#selectBone()
            } else {
                this.#unselectBone()
            }
        })

        // Listens to when a check is cliked and if its checked add the icon to the box, do the reverse if unchecked
        checkBalance.addEventListener("change", () => {
            if (checkBalance.checked) {
                this.#selectBalance()
            } else {
                this.#unselectBalance()
            }
        })

        //Loop through each boxes element
        boxes.forEach((box) => {
            icon1.addEventListener("mousedown", () => {
                chosenIcon = 1;
            })
            icon2.addEventListener("mousedown", () => {
                chosenIcon = 2;
            })
            icon3.addEventListener("mousedown", () => {
                chosenIcon = 3;
            })

            //When a draggable element dragged over a box element
            box.addEventListener("dragover", (e) => {
                e.preventDefault(); //Prevent default behaviour
                box.classList.add("hovered");
            });
            //When a draggable element leaves box element
            box.addEventListener("dragleave", () => {
                box.classList.remove("hovered", "border-success");
                box.classList.add("border-dark")
            });
            box.addEventListener("drop", () => {
                if (chosenIcon === 1) {
                    //When a draggable element is dropped on a box element
                    box.appendChild(icon1);
                    box.classList.remove("hovered", "border-dark");
                    box.classList.add("border-success")
                    icon1.classList.remove("p-3")
                    icon1.classList.add("justify-content-center", "ms-3")
                    checkMuscle.checked = true;
                } else if (chosenIcon === 2) {
                    //When a draggable element is dropped on a box element
                    box.appendChild(icon2);
                    box.classList.remove("hovered", "border-dark");
                    box.classList.add("border-success")
                    icon2.classList.remove("p-3")
                    icon2.classList.add("justify-content-center", "ms-4")
                    checkBone.checked = true;
                } else if (chosenIcon === 3) {
                    //When a draggable element is dropped on a box element
                    box.appendChild(icon3);
                    box.classList.remove("hovered", "border-dark");
                    box.classList.add("border-success")
                    icon3.classList.remove("p-3")
                    icon3.classList.add("justify-content-center", "ms-3")
                    checkBalance.checked = true;
                }
            });
        });
    }

    /**
     * Sends the chosen recommendation to the databse, if there is already a recommendation, update the original
     *
     * @author Kaifie Dil.
     * @param event  = the click event
     * @returns {Promise<void>}
     */
    async #saveRecommendation(event) {
        // Prevents the default behaviour of the event
        event.preventDefault();

        // Get the checkboxes from the html
        const checkMuscle = document.getElementById("checkMuscle");
        const checkBone = document.getElementById("checkBone");
        const checkBalance = document.getElementById("checkBalance");

        let selectMuscle = 0;
        let selectBone = 0;
        let selectBalance = 0;

        const errorBox = this.#recommendationView.querySelector(".error");

        //  Add validation for if nothing is chosen
        if (!checkMuscle.checked && !checkBone.checked && !checkBalance.checked) {
            errorBox.innerHTML = "Kies minimaal 1 aanbeveling!"
            return;
        }

        errorBox.innerHTML = "";

        // Update local variable if a checkbox is checked
        if (checkMuscle.checked) {
            selectMuscle = 1;
        }
        if (checkBone.checked) {
            selectBone = 1;
        }
        if (checkBalance.checked) {
            selectBalance = 1;
        }

        try {
            errorBox.innerHTML = "";

            try {
                // Check if a recommendation is already in the database for the current user
                let dataCheck = await this.#recommendationRepository.checkRecommendation(this.#userId);

                // Stringify the data gotten from the database
                let stringDataCheck = JSON.stringify(dataCheck)

                // if the returned data doesn't contain a user id, save a new recommendation for the user, otherwise
                // update the existing data in the database
                if (!stringDataCheck.includes("user_id")) {
                    const savaData = await this.#recommendationRepository.saveRecommendation(this.#userId, selectMuscle, selectBone, selectBalance);
                } else if (stringDataCheck.includes("user_id")) {
                    const updateData = await this.#recommendationRepository.updateRecommendation(this.#userId, selectMuscle, selectBone, selectBalance);
                }
            } catch (e) {
                console.log("error");
                errorBox.innerHTML = "Er is iets fout gegaan met het opslaan!"
            }

            // After it is done, load the welcome controller
            App.loadController(App.CONTROLLER_HOME);
        } catch (e) {
            errorBox.innerHTML = "Er is iets fout gegaan bij het opslaan"
        }
    }
}