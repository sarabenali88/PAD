/**
 *
 * Controller for open question entity
 * @author Sara Benali
 */
import {Controller} from "./controller.js";
import {OpenQuestionRepository} from "../repositories/openQuestionRepository.js";
import { QuestionMovementRepository } from "../repositories/questionMovementRepository.js";
import { App } from "../app.js";

export class OpenQuestionController extends Controller {
    #openQuestionView;
    #openQuestionRepository;
    #questionMovementRepository;
    #question_id;
    #question_movement_id;
    #survey_id;
    #user_id;
    #user_input;
    #order;
    #totalAmountOfQuestions;

    /**
     *
     * constructor
     * @author Sara Benali
     */

    constructor() {
        super();
        this.#question_id = 4;
        this.#question_movement_id = 6;
        this.#survey_id = 1;
        this.#user_id = App.sessionManager.get("user_id");
        this.#user_input = "";
        this.#order = null;
        this.#totalAmountOfQuestions = null;
        this.#openQuestionRepository = new OpenQuestionRepository();
        this.#questionMovementRepository = new QuestionMovementRepository();

        this.#setupView();
    }


    /**
     *
     * @return {Promise<void>}
     * Sets up view
     * @author Sara Benali
     *
     */
    async #setupView() {
        this.#openQuestionView = await super.loadHtmlIntoContent("html_views/open_question.html");
        this.#order = await this.#questionMovementRepository.getLastAnsweredQuestionOrderNum(1, this.#user_id);
        this.#order = this.#order[0].last_answered + 1;

        this.#openQuestionView.querySelector(".next-btn").addEventListener("click", (event) => {
            this.#saveOpenQuestion(event);
        });

        await this.#setTitle(this.#question_id)
        await this.#setQuestion(this.#question_movement_id);
        await this.#setAnswer(this.#survey_id, this.#question_id, this.#user_id);

        this.#totalAmountOfQuestions = await this.#questionMovementRepository.getTotalAmountOfQuestions(1);
        await this.#setupProgressBar();
        this.#handlePreviousButton();
    }

    /**
     *
     * @param event
     * @return {Promise<void>}
     * validate user input and insert or update answer
     * @author Sara Benali
     */
    async #saveOpenQuestion(event) {
        event.preventDefault();

        const days = this.#openQuestionView.querySelector("#inputDay").value;
        const warningBox = this.#openQuestionView.querySelector(".error");
        const feedback = this.#openQuestionView.querySelector(".needs-validation");

        if (days > 7 || days < 0) {
            feedback.classList.add('was-validated');
            warningBox.innerHTML = "Dagen kunnen niet hoger dan 7 zijn";
            return;
        } else if (days.length === 0) {
            feedback.classList.add('was-validated');
            warningBox.innerHTML = "Voer een antwoord in!";
            return;
        }

        const questionAnswer = await this.#questionMovementRepository.getQuestionAnswer(
            this.#survey_id, this.#question_id, this.#user_id);
        if (questionAnswer.length === 1) {
            await this.#questionMovementRepository.updateQuestionAnswer(
                days, this.#question_id, this.#survey_id, this.#user_id);
        } else {
            await this.#questionMovementRepository.postQuestionMovementAnswer(
                this.#order, this.#question_id, this.#survey_id, this.#user_id, days);
            await this.#questionMovementRepository.updateLastAnsweredQuestionOrderNum(
                this.#order, this.#survey_id, this.#user_id);
        }

        this.#handleNextButtonAnimation();
    }

    /**
     *
     * @param question_id
     * @return {Promise<void>}
     * inserts title into view
     * @author Sara Benali
     */
    async #setTitle(question_id) {
        const header = this.#openQuestionView.querySelector("#headerTitle");
        try {
            const data = await this.#openQuestionRepository.getTitle(question_id);
            header.innerHTML = data[0].title;

        } catch (e) {
            console.log("help");
        }
    }

    /**
     *
     * @param question_movement_id
     * @return {Promise<void>}
     * inserts queston into view
     * @author Sara Benali
     */
    async #setQuestion(question_movement_id) {
        const question = this.#openQuestionView.querySelector("#questionTitle");
        try {
            const data = await this.#openQuestionRepository.getQuestion(question_movement_id);
            question.innerHTML = data[0].text;
        } catch (e) {
            console.log("Iets gaat niet goed!");
        }
    }

    /**
     *
     * @param survey_id
     * @param question_id
     * @param user_id
     * @return {Promise<void>}
     * inserts last answer into answer field
     * @author Sara Benali
     */
    async #setAnswer(survey_id, question_id, user_id) {
        const answer = this.#openQuestionView.querySelector("#inputDay");

        try {
            const data = await this.#questionMovementRepository.getQuestionAnswer(survey_id, question_id, user_id);

            if (data.length !== 0) {
                answer.value = data[data.length - 1].text;
            }
        } catch (e) {
            console.log("Iets gaat niet goed!");
        }
    }

    /**
     * Makes sure the last answered row is updated when the previous button is clicked. Also loads the question controller.
     *
     * @author Tim Knops
     */
    #handlePreviousButton() {
        const previousButton = this.#openQuestionView.querySelector(".prev-btn");
        const form = this.#openQuestionView.querySelector("form");
        const previousSpinner = this.#openQuestionView.querySelector(".prev-spinner");
        const progressBar = this.#openQuestionView.querySelector(".progress-bar");

        previousButton.addEventListener("click", async () => {
            let currentQuestionNum =
                await this.#questionMovementRepository.getLastAnsweredQuestionOrderNum(1, this.#user_id);
            currentQuestionNum = currentQuestionNum[0].last_answered + 1;

            await this.#questionMovementRepository.updateLastAnsweredQuestionOrderNum(currentQuestionNum - 2, 1, this.#user_id);
            previousSpinner.classList.remove("d-none");

            setTimeout( async () => {
                form.classList.remove("was-validated");
                previousSpinner.classList.add("d-none");

                const percentage = (this.#order - 1) / this.#totalAmountOfQuestions[0].questions_in_survey * 100;
                progressBar.style.width = `${percentage}%`;

                App.loadController(App.CONTROLLER_QUESTION);
            }, 1200);
        });
    }

    /**
     * Sets up the progress bar at the right progress.
     *
     * @author Tim Knops
     */
    async #setupProgressBar() {
        const progressBar = this.#openQuestionView.querySelector(".progress-bar");
        const percentage = ((this.#order - 1) / this.#totalAmountOfQuestions[0].questions_in_survey) * 100;

        progressBar.style.width = `${percentage}%`;
    }

    /**
     * Adds the animation for the next button and loads the question controller.
     *
     * @author Tim Knops
     */
    #handleNextButtonAnimation() {
        const form = this.#openQuestionView.querySelector("form");
        const submitSpinner = this.#openQuestionView.querySelector(".submit-spinner");
        const progressBar = this.#openQuestionView.querySelector(".progress-bar");

        form.classList.add("was-validated");
        submitSpinner.classList.remove("d-none");

        setTimeout( async () => {
            await this.#questionMovementRepository.updateLastAnsweredQuestionOrderNum(this.#order, 1, this.#user_id);

            this.#order++;

            form.classList.remove("was-validated");
            submitSpinner.classList.add("d-none");

            const percentage = ((this.#order - 1) / this.#totalAmountOfQuestions[0].questions_in_survey) * 100;
            progressBar.style.width = `${percentage}%`;

            App.loadController(App.CONTROLLER_QUESTION);
        }, 1200);
    }
}