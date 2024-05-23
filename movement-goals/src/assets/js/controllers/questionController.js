import { QuestionRepository } from "../repositories/questionRepository.js";
import { Controller } from "./controller.js";
import { QuestionMovementRepository } from "../repositories/questionMovementRepository.js";
import { App } from "../app.js";

/**
 * Handles the question type for the survey.
 *
 * @author Tim Knops
 */
export class QuestionController extends Controller {
    #questionRepository;
    #questionMovementRepository;

    /** Constructor */
    constructor() {
        super();
        this.#questionRepository = new QuestionRepository();
        this.#questionMovementRepository = new QuestionMovementRepository();

        this.#switchQuestionType();
    }

    /**
     * Switches the controller depending on the type of question
     *
     * @author Tim Knops
     */
    async #switchQuestionType() {
        const currentQuestionOrderNum =
            await this.#questionMovementRepository.getLastAnsweredQuestionOrderNum(1, App.sessionManager.get("user_id"));
        const totalAmountOfQuestions = await this.#questionMovementRepository.getTotalAmountOfQuestions(1);

        if (currentQuestionOrderNum[0].last_answered >= totalAmountOfQuestions[0].questions_in_survey) { // If the end of the survey is reached.
            App.loadController(App.CONTROLLER_HOME);
        } else {
            const currentQuestionType = await this.#questionRepository.getQuestionType(currentQuestionOrderNum[0].last_answered + 1, 1);

            if (currentQuestionType[0].question_type_id === 3) { // If the question type is movement.
                App.loadController(App.CONTROLLER_INTAKE);
            } else {
                App.loadController(App.CONTROLLER_OPEN_QUESTION);
            }
        }
    }
}