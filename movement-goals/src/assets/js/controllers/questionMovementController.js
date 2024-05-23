import { Controller } from "./controller.js";
import { QuestionMovementRepository } from "../repositories/questionMovementRepository.js";
import { App } from "../app.js";

/**
 * Controller for all the question movement types.
 *
 * @author Tim Knops
 */
export class QuestionMovementController extends Controller {
    #questionView;
    #questionMovementRepository;
    #order;
    #userInput;
    #questionData;
    #totalAmountOfQuestions;
    #userId;

    /** Constructor. */
    constructor() {
        super();
        this.#questionMovementRepository = new QuestionMovementRepository();
        this.#order = 0;
        this.#userInput = "";
        this.#questionData = null;
        this.#totalAmountOfQuestions = null;
        this.#userId = App.sessionManager.get("user_id");

        this.#setupView();
    }

    /**
     * Sets up the view for the question.
     *
     * @author Tim Knops
     */
    async #setupView() {
        this.#order = await this.#questionMovementRepository.getLastAnsweredQuestionOrderNum(1, this.#userId);
        this.#order = this.#order[0].last_answered + 1;

        this.#totalAmountOfQuestions = await this.#questionMovementRepository.getTotalAmountOfQuestions(1);
        let percentage = (this.#order - 1) / this.#totalAmountOfQuestions[0].questions_in_survey * 100;

        this.#questionView = await super.loadHtmlIntoContent("html_views/question_movement.html");

        let questionId = await this.#fetchQuestionTitle(this.#order);
        await this.#fetchQuestionMovementData(this.#order);

        const form = this.#questionView.querySelector("form");
        const submitSpinner = this.#questionView.querySelector(".submit-spinner");
        const previousSpinner = this.#questionView.querySelector(".prev-spinner");
        const previousQuestionButton = this.#questionView.querySelector(".prev-btn");
        const progressBar = this.#questionView.querySelector(".progress-bar");

        progressBar.style.width = `${percentage}%`;

        const isAnswered = await this.#questionMovementRepository.getQuestionAnswer(1, questionId, this.#userId);
        if (isAnswered.length === 1) {
            this.#fillInputFields(isAnswered);
        }

        form.addEventListener("submit", async (e) => {
            e.preventDefault();

            if (this.#order < this.#totalAmountOfQuestions[0].questions_in_survey && this.#validateUserInput()) {
                this.#parseUserInput();

                const isAnswered = await this.#questionMovementRepository.getQuestionAnswer(1, questionId, this.#userId);
                if (isAnswered.length === 1) { // If question is already answered, update, else insert and update last answered question.
                    await this.#questionMovementRepository.updateQuestionAnswer(this.#userInput, questionId, 1, this.#userId);
                    await this.#questionMovementRepository.updateLastAnsweredQuestionOrderNum(this.#order, 1, this.#userId);

                } else {
                    await this.#questionMovementRepository.postQuestionMovementAnswer(
                        this.#order, questionId, 1, this.#userId, this.#userInput);
                    await this.#questionMovementRepository.updateLastAnsweredQuestionOrderNum(this.#order, 1, this.#userId);
                }

                this.#userInput = "";
                form.classList.add("was-validated");
                submitSpinner.classList.remove("d-none");

                setTimeout( async () => {
                    this.#order++;
                    this.#resetColumns();
                    form.classList.remove("was-validated");
                    submitSpinner.classList.add("d-none");

                    percentage = ((this.#order - 1) / this.#totalAmountOfQuestions[0].questions_in_survey) * 100;
                    progressBar.style.width = `${percentage}%`;


                    App.loadController(App.CONTROLLER_QUESTION);


                    // questionId = await this.#fetchQuestionTitle(this.#order);
                    // await this.#fetchQuestionMovementData(this.#order);

                    // const isAnswered = await this.#questionMovementRepository.getQuestionAnswer(1, questionId, this.#userId);
                    // if (isAnswered.length === 1) {
                    //     this.#fillInputFields(isAnswered);
                    // }
                }, 1200);
            }
        });

        previousQuestionButton.addEventListener("click", () => {
            if (this.#order > 1) {
                this.#userInput = "";
                previousSpinner.classList.remove("d-none");

                setTimeout( async () => {
                    this.#order--;
                    this.#resetColumns();
                    form.classList.remove("was-validated");
                    previousSpinner.classList.add("d-none");

                    percentage = ((this.#order - 1) / this.#totalAmountOfQuestions[0].questions_in_survey) * 100;
                    progressBar.style.width = `${percentage}%`;

                    await this.#questionMovementRepository.updateLastAnsweredQuestionOrderNum(this.#order - 1, 1, this.#userId);

                    App.loadController(App.CONTROLLER_QUESTION);

                    // questionId = await this.#fetchQuestionTitle(this.#order);
                    // await this.#fetchQuestionMovementData(this.#order);
                    //
                    // const isAnswered = await this.#questionMovementRepository.getQuestionAnswer(1, questionId, this.#userId);
                    // if (isAnswered.length === 1) {
                    //     this.#fillInputFields(isAnswered);
                    // }
                }, 1200);
            }
        });
    }

    /**
     * Removes all the columns.
     *
     * @author Tim Knops
     */
    #resetColumns() {
        const reset = this.#questionView.querySelectorAll(".reset");
        reset.forEach((e) => {
            e.remove();
        })
    }

    /**
     * Sets the question title and description in the view.
     *
     * @param {number} questionOrder The order number of the question.
     * @returns {Promise<Object>} Object containing the title and description of the question.
     * @author Tim Knops
     */
    async #fetchQuestionTitle(questionOrder) {
        try {
            const questionData = await this.#questionMovementRepository.getTitle(questionOrder);

            this.#questionView.querySelector("h2").innerHTML = questionData[0].title;
            this.#questionView.querySelector("#question-description").innerHTML = questionData[0].text;
            return questionData[0].question_id;
        } catch (e) {
            console.error(e);
        }
    }

    /**
     * Generates all the rows and column of the movement question type.
     *
     * @param {number} questionOrder The order number of the question.
     * @author Tim Knops
     */
    async #fetchQuestionMovementData(questionOrder) {
        this.#questionData = await this.#questionMovementRepository.getQuestionMovementData(questionOrder);
        const columnTitleTemplate = this.#questionView.querySelector("#columnTitleTemplate");

        try {
            const container = this.#questionView.querySelector(".container");
            container.style.height = "calc(100vh - 98px)";

            this.#createRowTitlesColumn();
            this.#createDaysPerColumn(columnTitleTemplate);
            this.#createTimePerColumn(columnTitleTemplate);
            this.#createIntensityColumn(columnTitleTemplate);
        } catch (e) {
            console.error(e);
        }
    }

    /**
     * Generates everything related to the row titles.
     *
     * @author Tim Knops
     */
    #createRowTitlesColumn() {
        const titleRowTemplate = this.#questionView.querySelector("#titleRowTemplate");
        const openQuestionTemplate = this.#questionView.querySelector("#openQuestionTemplate");

        this.#insertColumn("rowTitlesColumn");

        const rowTitlesColumn = this.#questionView.querySelector("#rowTitlesColumn");
        this.#insertRows(rowTitlesColumn, "titleRow");

        for (let i = 0; i <= this.#questionData.length; i++) {
            if (this.#questionData[0].text === "open") {
                for (let i = 1; i <= 4; i++) {
                    const openQuestionTemplateClone = openQuestionTemplate.content.cloneNode(true);
                    this.#questionView.querySelector(`#titleRow${i}`).appendChild(openQuestionTemplateClone);
                }

                const openQuestionNums = this.#questionView.querySelectorAll("#openQuestionNum");
                for (let i = 0; i < openQuestionNums.length; i++) {
                    openQuestionNums[i].innerHTML = `${i + 1}.`;
                }

                break;
            } else {
                const titleRowClone = titleRowTemplate.content.cloneNode(true);
                if (i > 0) {
                    titleRowClone.firstElementChild.innerHTML = this.#questionData[i - 1].text;
                }

                this.#questionView.querySelector(`#titleRow${i}`).appendChild(titleRowClone);
            }
        }
    }

    /**
     * Generates everything related to the 'days per' column.
     *
     * @param {HTMLTemplateElement} columnTitleTemplate The template element of the column.
     * @author Tim Knops
     */
    #createDaysPerColumn(columnTitleTemplate) {
        if (this.#questionData[0].days_per !== null) {
            const daysPerSelectTemplate = this.#questionView.querySelector("#daysPerSelectTemplate");
            const checkboxTemplate = this.#questionView.querySelector("#checkboxTemplate");

            // Adding column.
            this.#insertColumn("daysPerColumn");

            // Adding rows.
            const daysPerColumn = this.#questionView.querySelector("#daysPerColumn"); // Has to be selected after creating.
            this.#insertRows(daysPerColumn, "daysPerRow");

            // Adding column title.
            const columnTitleTemplateClone = columnTitleTemplate.content.cloneNode(true);
            columnTitleTemplateClone.firstElementChild.firstElementChild.innerHTML = `Aantal dagen per ${this.#questionData[0].days_per}`;
            this.#questionView.querySelector("#daysPerRow0").appendChild(columnTitleTemplateClone);

            // Adding select options and checkbox.
            for (let i = 0; i < this.#questionData.length; i++) {
                if (this.#questionData[0].text === "open") {
                    for (let i = 1; i <= 4; i++) {
                        const row = this.#questionView.querySelector(`#daysPerRow${i}`);

                        const daysPerSelectTemplateClone = daysPerSelectTemplate.content.cloneNode(true);
                        row.appendChild(daysPerSelectTemplateClone);
                        row.classList.add("gap-3");
                    }
                    break;
                } else {
                    const row = this.#questionView.querySelector(`#daysPerRow${i + 1}`);

                    if (this.#questionData[i].not_applicable.data[0] === 1) {
                        const checkboxTemplateClone = checkboxTemplate.content.cloneNode(true);
                        row.appendChild(checkboxTemplateClone);
                    } else {
                        const daysPerSelectTemplateClone = daysPerSelectTemplate.content.cloneNode(true);
                        row.appendChild(daysPerSelectTemplateClone);
                        row.classList.add("gap-3");
                    }
                }
            }
        }
    }

    /**
     * Generates everything related to the 'time per' column.
     *
     * @param {HTMLTemplateElement} columnTitleTemplate The template element of the column.
     * @author Tim Knops
     */
    #createTimePerColumn(columnTitleTemplate) {
        if (this.#questionData[0].time_per !== null) {
            const timePerInputTemplate = this.#questionView.querySelector("#timePerInputTemplate");
            const checkboxTemplate = this.#questionView.querySelector("#checkboxTemplate");
            const checkbox = this.#questionView.querySelector("#checkbox");

            this.#insertColumn("timePerColumn");

            const timePerColumn = this.#questionView.querySelector("#timePerColumn");
            this.#insertRows(timePerColumn, "timePerRow");

            const columnTitleTemplateClone = columnTitleTemplate.content.cloneNode(true);
            columnTitleTemplateClone.firstElementChild.firstElementChild.innerHTML = `Gemiddelde tijd per ${this.#questionData[0].time_per}`;
            this.#questionView.querySelector("#timePerRow0").appendChild(columnTitleTemplateClone);

            // Adding input fields, and optional checkbox.
            for (let i = 0; i < this.#questionData.length; i++) {
                if (this.#questionData[0].text === "open") {
                    for (let i = 1; i <= 4; i++) {
                        const row = this.#questionView.querySelector(`#timePerRow${i}`);
                        const timePerInputTemplateClone = timePerInputTemplate.content.cloneNode(true);
                        row.appendChild(timePerInputTemplateClone);
                        row.classList.add("gap-3");
                    }

                    break;
                } else {
                    const row = this.#questionView.querySelector(`#timePerRow${i + 1}`);

                    if (this.#questionData[i].not_applicable.data[0] === 1 && checkbox === null) {
                        const checkboxTemplateClone = checkboxTemplate.content.cloneNode(true);
                        row.appendChild(checkboxTemplateClone);
                    }  else if (this.#questionData[i].not_applicable.data[0] === 0) {
                        const timePerInputTemplateClone = timePerInputTemplate.content.cloneNode(true);
                        row.appendChild(timePerInputTemplateClone);
                        row.classList.add("gap-3");
                    }
                }
            }
        }
    }

    /**
     * Generates everything related to the 'intensity per' column.
     *
     * @param {HTMLTemplateElement} columnTitleTemplate The template element of the column.
     * @author Tim Knops
     */
    #createIntensityColumn(columnTitleTemplate) {
        const cols = this.#questionView.querySelectorAll(".col");

        if (this.#questionData[0].intensity !== null) {
            const intensitySelectTemplate = this.#questionView.querySelector("#intensitySelectTemplate");

            this.#insertColumn("intensityColumn");

            const intensityColumn = this.#questionView.querySelector("#intensityColumn");
            this.#insertRows(intensityColumn, "intensityRow");

            const columnTitleTemplateClone = columnTitleTemplate.content.cloneNode(true);
            columnTitleTemplateClone.firstElementChild.firstElementChild.innerHTML = "Inspanning";
            this.#questionView.querySelector("#intensityRow0").appendChild(columnTitleTemplateClone);

            let isOpen = false;
            if (this.#questionData[0].text === "open") {
                const intensityOptions = this.#questionData[0].intensity.split("/");

                for (let i = 1; i <= 4; i++) {
                    const row = this.#questionView.querySelector(`#intensityRow${i}`);

                    const intensitySelectTemplateClone = intensitySelectTemplate.content.cloneNode(true);
                    intensitySelectTemplateClone.firstElementChild.setAttribute("id", `intensitySelect${i}`);
                    for (let j = 0; j < intensityOptions.length; j++) {
                        intensitySelectTemplateClone.firstElementChild[j].innerHTML = intensityOptions[j];
                    }
                    row.appendChild(intensitySelectTemplateClone);
                }

                isOpen = true;
            }

            for (let i = 0; i < this.#questionData.length - 1; i++) {
                if (isOpen === true) {
                    break;
                }
                const row = this.#questionView.querySelector(`#intensityRow${i + 1}`);

                const intensitySelectTemplateClone = intensitySelectTemplate.content.cloneNode(true);
                intensitySelectTemplateClone.firstElementChild.setAttribute("id", `intensitySelect${i}`);
                row.appendChild(intensitySelectTemplateClone);

                const intensitySelect = this.#questionView.querySelector(`#intensitySelect${i}`);
                const intensityOptions = this.#questionData[i].intensity.split("/");
                for (let j = 0; j < intensityOptions.length; j++) {
                    intensitySelect[j].innerHTML = intensityOptions[j];
                }
            }
        } else if (cols.length === 2) {
            for (let i = 0; i < cols.length; i++) {
                cols[i].classList.add("col-4");
            }
        } else {
            this.#questionView.querySelector("#rowTitlesColumn").classList.add("col-4");
            this.#questionView.querySelector("#daysPerColumn").classList.add("col-3");
            this.#questionView.querySelector("#timePerColumn").classList.add("col-3");
        }
    }

    /**
     * Inserts a column into the form.
     *
     * @param {string} idName The id to be given to the column.
     * @author Tim Knops
     */
    #insertColumn(idName) {
        const form = this.#questionView.querySelector("form");
        const columnTemplateClone = this.#questionView.querySelector("#column-template").content.cloneNode(true);

        columnTemplateClone.firstElementChild.setAttribute("id", `${idName}`);
        form.insertBefore(columnTemplateClone, this.#questionView.querySelector("#button"));
    }

    /**
     * Inserts the rows into the column.
     *
     * @param {HTMLDivElement} column The column that the rows need to be inserted into.
     * @param {string} idName The id to be given to the column.
     * @author Tim Knops
     */
    #insertRows(column, idName) {
        const rowTemplate = this.#questionView.querySelector("#rowTemplate");

        if (this.#questionData[0].text === "open") {
            for (let i = 0; i <= 4; i++) {
                const rowTemplateClone = rowTemplate.content.cloneNode(true);
                rowTemplateClone.firstElementChild.setAttribute("id", `${idName}${i}`);
                if (i === 0) {
                    rowTemplateClone.firstElementChild.style.height = "10%";
                    rowTemplateClone.firstElementChild.classList.remove("h-25");
                }
                column.appendChild(rowTemplateClone);
            }
        } else {
            for (let i = 0; i <= this.#questionData.length; i++) {
                const rowTemplateClone = rowTemplate.content.cloneNode(true);
                rowTemplateClone.firstElementChild.setAttribute("id", `${idName}${i}`);
                if (i === 0) {
                    rowTemplateClone.firstElementChild.style.height = "20%";
                    rowTemplateClone.firstElementChild.classList.remove("h-25");
                }
                column.appendChild(rowTemplateClone);
            }
        }
    }

    /**
     * Validates the input that is given be the user.
     *
     * @returns {boolean} True if the input is valid, else false.
     * @author Tim Knops
     */
    #validateUserInput() {
        const daysPerSelect = this.#questionView.querySelectorAll(".form-select-days");
        const intensitySelect = this.#questionView.querySelectorAll(".intensity-select");
        const timePerSelect = this.#questionView.querySelectorAll(".time-per-select");
        const openInput = this.#questionView.querySelectorAll(".open-input");
        const errorTemplate = this.#questionView.querySelector("#error");
        const buttonDiv = this.#questionView.querySelector("#button");
        const checkbox = this.#questionView.querySelector("#checkbox");
        const errorTemplateClone = errorTemplate.content.cloneNode(true);
        const alert = this.#questionView.querySelector(".alert");

        // Validation for the time per open input fields.
        let isValidated = true, isZero = true;
        for (let i = 0; i < timePerSelect.length; i++) {
            if (alert !== null) {
                alert.remove();
            }

            if (isNaN(timePerSelect[i].value)) {
                timePerSelect[i].classList.add("is-invalid");
                isValidated = false;

                if (this.#questionView.querySelector(".alert") === null) {
                    errorTemplateClone.firstElementChild.innerHTML = "Invoer is geen getal!";
                    buttonDiv.insertBefore(errorTemplateClone, this.#questionView.querySelector("#button-container"));
                }
            } else if (i % 2 === 0 && (timePerSelect[i].value < 0 || timePerSelect[i].value > 24)) {
                timePerSelect[i].classList.add("is-invalid");
                isValidated = false;

                if (this.#questionView.querySelector(".alert") === null && timePerSelect[i].value < 0) {
                    errorTemplateClone.firstElementChild.innerHTML = "Getal kan niet onder de 0 zijn!";
                    buttonDiv.insertBefore(errorTemplateClone, this.#questionView.querySelector("#button-container"));
                } else if (this.#questionView.querySelector(".alert") === null && timePerSelect[i].value > 24) {
                    errorTemplateClone.firstElementChild.innerHTML = "Aantal uur kan niet langer zijn dan 24!";
                    buttonDiv.insertBefore(errorTemplateClone, this.#questionView.querySelector("#button-container"));
                }
            } else if (i % 1 === 0 && (timePerSelect[i].value < 0 || timePerSelect[i].value > 59)) {
                timePerSelect[i].classList.add("is-invalid");
                isValidated = false;

                if (this.#questionView.querySelector(".alert") === null && timePerSelect[i].value < 0) {
                    errorTemplateClone.firstElementChild.innerHTML = "Getal kan niet onder de 0 zijn!";
                    buttonDiv.insertBefore(errorTemplateClone, this.#questionView.querySelector("#button-container"));
                } else if (this.#questionView.querySelector(".alert") === null && timePerSelect[i].value > 24) {
                    errorTemplateClone.firstElementChild.innerHTML = "Als u meer dan 59 minuten per dag heeft ingevoerd, " +
                        "voeg dit a.u.b toe aan het aantal uur!";
                    buttonDiv.insertBefore(errorTemplateClone, this.#questionView.querySelector("#button-container"));
                }
            } else if (timePerSelect[i].classList.contains("is-invalid")) {
                timePerSelect[i].classList.remove("is-invalid");
                timePerSelect[i].classList.add("is-valid");

                if (timePerSelect[i].value.length !== 0) {
                    if (timePerSelect[i].value !== "0") {
                        isZero = false;
                    }
                }

            } else {
                timePerSelect[i].classList.add("is-valid");

                if (timePerSelect[i].value.length !== 0) {
                    if (timePerSelect[i].value !== "0") {
                        isZero = false;
                    }
                }
            }
        }

        for (let i = 0; i < daysPerSelect.length; i++) {
            if (daysPerSelect[i].value !== "0") {
                isZero = false;
            }

            daysPerSelect[i].classList.add("is-valid");
        }

        // Checkbox validation. If no time or days per is selected, user will be asked to check the checkbox.
        if (isZero && checkbox !== null && !checkbox.checked) {
            if (alert !== null) {
                alert.remove();
            }

            errorTemplateClone.firstElementChild.innerHTML =
                "Als u voor deze activiteit geen tijd heeft besteed, vink a.u.b 'Niet van toepassing' aan";
            buttonDiv.insertBefore(errorTemplateClone, this.#questionView.querySelector("#button-container"));

            checkbox.classList.add("is-invalid");
            isValidated = false;
        }

        for (let i = 0; i < intensitySelect.length; i++) {
            intensitySelect[i].classList.add("is-valid");
        }

        // Open input fields validation.
        for (let i = 0; i < openInput.length; i++) {
            if (alert !== null) {
                alert.remove();
            }

            if (openInput[i].value.length > 40) {
                openInput[i].classList.add("is-invalid");
                isValidated = false;

                errorTemplateClone.firstElementChild.innerHTML = "Sportnaam kan niet langer zijn dan 40 karakters!";
                buttonDiv.insertBefore(errorTemplateClone, this.#questionView.querySelector("#button-container"));
            } else if (openInput[i].classList.contains("is-invalid")) {
                openInput[i].classList.remove("is-invalid");
                openInput[i].classList.add("is-valid");
            } else {
                openInput[i].classList.add("is-valid");
            }
        }

        return isValidated;
    }

    /**
     * Parses the user input so a string so that it can be inserted into the database.
     *
     * @author Tim Knops
     */
    #parseUserInput() {
        const daysPerSelect = this.#questionView.querySelectorAll(".form-select-days");
        const intensitySelect = this.#questionView.querySelectorAll(".intensity-select");
        const timePerSelect = this.#questionView.querySelectorAll(".time-per-select");
        const openInput = this.#questionView.querySelectorAll(".open-input");
        const checkbox = this.#questionView.querySelector("#checkbox");

        let timePerIncrease = 0, loopLength = this.#questionData.length - 1;

        if (this.#questionData[0].text === "open") {
            loopLength = 3;
        }

        for (let i = 0; i < loopLength; i++) {
            if (checkbox !== null && checkbox.checked) {
                this.#userInput += "[Niet van toepassing]";
                break;
            } else if (this.#questionData[0].text === "open") {
                if (openInput[i].value.length === 0) {
                    break;
                }
                this.#userInput += `[(${openInput[i].value}), `;
            } else {
                this.#userInput += "["
            }

            if (this.#questionData[0].days_per !== null) {
                this.#userInput += `dagen per ${this.#questionData[0].days_per}: ${daysPerSelect[i].value}, `;
            }

            if (this.#questionData[0].time_per !== null) {
                this.#userInput += `tijd per ${this.#questionData[0].time_per}: ${timePerSelect[i + timePerIncrease].value} uur`;

                if (timePerSelect[i + timePerIncrease].value.length === 0) {
                    this.#userInput = this.#userInput.slice(0, -4);
                    this.#userInput += "0 uur";
                }
            }

            if (timePerSelect[i + timePerIncrease + 1].value.length !== 0) {
                this.#userInput += ` ${timePerSelect[i + timePerIncrease + 1].value} min`;
            }

            if (this.#questionData[0].intensity !== null && this.#questionData[0].days_per !== null && daysPerSelect[i].value !== "0") {
                this.#userInput +=`, inspanning: ${intensitySelect[i].options[intensitySelect[i].selectedIndex].text}`;
            }

            this.#userInput += "] ";
            timePerIncrease++;
        }
    }

    /**
     * Fills the input fields with the previous user answer.
     *
     * @param {Array<Object>} answer Array of objects containing the answer.
     * @author Tim Knops
     */
    #fillInputFields(answer) {
        const daysPerSelect = this.#questionView.querySelectorAll(".form-select-days");
        const intensitySelect = this.#questionView.querySelectorAll(".intensity-select");
        const timePerSelect = this.#questionView.querySelectorAll(".time-per-select");
        const openInput = this.#questionView.querySelectorAll(".open-input");
        const checkbox = this.#questionView.querySelector("#checkbox");

        if (answer[0].text === "[Niet van toepassing]") {
            checkbox.checked = true;
            return;
        }

        const parsedAnswer = answer[0].text.trim().split("] ");

        let timePerIncrease = 0;
        for (let i = 0; i < parsedAnswer.length; i++) {
            const parsedSubAnswer = parsedAnswer[i].split(",");

            for (let j = 0; j < parsedSubAnswer.length; j++) {
                const value = parsedSubAnswer[j].split(': ').pop().replace("]", "");

                if (value.includes("(")) {
                    openInput[i].value = value.replace("[", "").replace("(", "").replace(")", "");
                } else if (Number(value) > 0 || Number(value) < 8) {
                    daysPerSelect[i].value = Number(value);
                } else if (value.includes("uur")) {
                    timePerSelect[i + timePerIncrease].value = value.split(" ")[0];
                    if (value.includes("min")) {
                        timePerSelect[i + 1 + timePerIncrease].value = value.split(" ")[2];
                    } else {
                        timePerSelect[i + 1 + timePerIncrease].value = 0;
                    }
                } else if (value === "Langzaam" || value === "Licht") {
                    intensitySelect[i].value = "langzaam";
                } else if (value === "Gemiddeld") {
                    intensitySelect[i].value = "gemiddeld";
                } else if (value === "Snel" || value === "Zwaar") {
                    intensitySelect[i].value = "snel";
                }
            }

            timePerIncrease++;
        }
    }
}