import { Controller } from "./controller.js";
import { CalendarRepository } from "../repositories/calendarRepository.js";
import { App } from "../app.js";

/**
 * Controller class for all things related to the calendar.
 *
 * @author Tim Knops
 */
export class CalendarController extends Controller {
    #calendarView;
    #calendarRepository;
    #currentEvents;
    #calendar;
    #userId;
    #selectedEvent;
    #creationModal;
    #editModal;

    /** Constructor */
    constructor() {
        super();
        this.#calendarView = null;
        this.#calendarRepository = new CalendarRepository();
        this.#currentEvents = null;
        this.#calendar = null;
        this.#userId = App.sessionManager.get("user_id");

        this.#setupView();
    }

    /**
     * Sets up the view for the calendar.
     *
     * @author Tim Knops
     */
    async #setupView() {
        this.#calendarView = await super.loadHtmlIntoContent("html_views/calendar.html");

        await this.#setupCalendar();
        await this.#addExistingEvents();
        this.#handleCreationModal();
        this.#handleEditEventModal();
        this.#handleCustomTitleCreation();
        await this.#addUserActivitiesToSelect();
    }

    /**
     * Sets up the calendar object.
     *
     * @author Tim Knops
     */
    async #setupCalendar() {
        const handleDateClick = (selected) => {
            this.#selectedEvent = selected;

            const createModalTitle = this.#calendarView.querySelector("#new-event-title");
            createModalTitle.value = "";

            this.#creationModal.show();
        };

        const handleEventClick = (selected) => {
            this.#selectedEvent = selected;

            this.#handleEditEventCustomTitleSelect();

            this.#fillEditModalInputFields();
            this.#editModal.show();
        };

        const handleDragResizeEventUpdate = (selected) => {
            this.#selectedEvent = selected;

            this.#selectedEvent.event.setStart(this.#selectedEvent.event.startStr);
            this.#selectedEvent.event.setEnd(this.#selectedEvent.event.endStr);

            this.#updateSideBarEvents(this.#calendar.getEvents(), false);
        }

        const calendarEl = this.#calendarView.querySelector("#calendar");
        this.#calendar = new FullCalendar.Calendar(calendarEl, {
            initialView: "timeGridWeek",
            height: "calc(100vh - var(--footer-height) - var(--navbar-height) - 70px)",
            headerToolbar: {
                left: "prev,next today",
                center: "title",
                right: "dayGridMonth,timeGridWeek,timeGridDay,listMonth",
            },
            buttonText: {
                today: "Vandaag",
                month: "Maand",
                week: "Week",
                day: "Dag",
                list: "Lijst"
            },
            editable: true,
            selectable: true,
            selectMirror: true,
            dayMaxEvents: true,
            navLinks: true,
            themeSystem: "bootstrap5",
            locale: "nl",
            timeZone: "nl",
            firstDay: 1,
            allDaySlot: false,
            eventColor: "#43806c",
            unselectCancel: ".modal",
            slotLabelFormat: {
                hour: 'numeric',
                minute: '2-digit',
                omitZeroMinute: false,
            },
            select: handleDateClick,
            eventClick: handleEventClick,
            eventDrop: handleDragResizeEventUpdate,
            eventResize: handleDragResizeEventUpdate,
        });

        this.#calendar.render();
    }

    /**
     * Adds the already existing events to the calendar.
     *
     * @author Tim Knops
     */
    async #addExistingEvents() {
        this.#currentEvents = await this.#calendarRepository.getAllEvents(this.#userId);
        this.#currentEvents.forEach((event) => {
           if (event.custom !== null) {
               event.custom = true;
           }
        });

        this.#calendar.addEventSource(this.#currentEvents); // Adding existing events to calendar.

        // Adding events to the sidebar.
        this.#updateSideBarEvents(this.#currentEvents, true);
    }

    /**
     * Updates the events sidebar.
     *
     * @param events            The events that the sidebar is to be updates with
     * @param isExistingEvents  Whether or not the events are from the database or not.
     * @author Tim Knops
     */
    #updateSideBarEvents(events, isExistingEvents) {
        const existingEvents = this.#calendarView.querySelectorAll(".event");
        const eventTemplate = this.#calendarView.querySelector("#event-template");
        const sideBar = this.#calendarView.querySelector(".calendar-sidebar");

        existingEvents.forEach((event) => {
           event.remove();
        });

        events.forEach((event) => {
            const eventTemplateClone = eventTemplate.content.cloneNode(true);
            eventTemplateClone.firstElementChild.firstElementChild.innerHTML = `${event.title}`;

            if (isExistingEvents) {
                const yearTimeStart = event.start.split("T");
                const yearTimeEnd = event.end.split("T");

                eventTemplateClone.firstElementChild.lastElementChild.innerHTML =
                    `${yearTimeStart[0]} | ${yearTimeStart[1].slice(0, -8)} - ${yearTimeEnd[1].slice(0, -8)}`;
            } else {
                const formattedEvent = event.toPlainObject();

                if (formattedEvent.start.substring(formattedEvent.start.length - 1, formattedEvent.start.length) !== "Z") {
                    formattedEvent.start += "Z";
                    formattedEvent.end += "Z";
                }

                const yearTimeStart = formattedEvent.start.split("T");
                const yearTimeEnd = formattedEvent.end.split("T");

                eventTemplateClone.firstElementChild.lastElementChild.innerHTML =
                    `${yearTimeStart[0]} | ${yearTimeStart[1].slice(0, -4)} - ${yearTimeEnd[1].slice(0, -4)}`;
            }

            sideBar.appendChild(eventTemplateClone);
        });

        if (!isExistingEvents) {
            this.#saveEvents();
        }
    }

    /**
     * Saves the events to the database.
     *
     * @author Tim Knops
     */
    #saveEvents() {
        const events = this.#calendar.getEvents();
        let objectEventsArr = [];

        events.forEach((event) => {
            event.setExtendedProp("custom", event.extendedProps.custom);

            event = event.toPlainObject();

            event.start = event.start.replace("T", " ").replace("Z", "");
            event.end = event.end.replace("T", " ").replace("Z", "");

            objectEventsArr.push(event);
        });

        this.#calendarRepository.saveAllEvents(this.#userId, objectEventsArr);
    }

    /**
     * Handles everything related to the event creation modal.
     *
     * @author Tim Knops
     */
    #handleCreationModal() {
        this.#creationModal = new bootstrap.Modal(this.#calendarView.querySelector("#new-event-modal"));
        const saveButton = this.#calendarView.querySelector("#new-event-save");
        const closeButtons = this.#calendarView.querySelectorAll(".modal-close-btn");
        const select = this.#calendarView.querySelector(".event-title-select");

        saveButton.addEventListener("click", () => {
            let title = select.value, isCustomTitle = null;

            if (select.value === "custom") {
                title = this.#calendarView.querySelector("#new-event-title").value;
                isCustomTitle = true;
            }

            this.#calendar.unselect();

            this.#calendar.addEvent({
                title: title === "" ? "Geen titel" : title,
                start: this.#selectedEvent.startStr,
                end: this.#selectedEvent.endStr,
                custom: isCustomTitle
            });

            this.#updateSideBarEvents(this.#calendar.getEvents(), false);
            this.#creationModal.hide();
        });

        closeButtons.forEach((closeButton) => {
           closeButton.addEventListener("click", () => {
               this.#creationModal.hide();
               this.#editModal.hide();
           });
        });

        this.#creationModal._element.addEventListener("hide.bs.modal", () => {
            this.#selectedEvent.view.calendar.unselect();
        });
    }

    /**
     * Gives the user the option to add a custom title.
     *
     * @author Tim Knops
     */
    #handleCustomTitleCreation() {
        const select = this.#calendarView.querySelector(".event-title-select");
        const editSelect = this.#calendarView.querySelector(".edit-event-title-select");
        const customTitleDiv = this.#calendarView.querySelector(".custom-title-div");
        const selectEditDiv = this.#calendarView.querySelector(".edit-custom-title-div")

        select.addEventListener("change", () => {
            if (select.value === "custom") {
                customTitleDiv.classList.remove("d-none");
            } else {
                customTitleDiv.classList.add("d-none")
            }
        });

        editSelect.addEventListener("change", () => {
            if (editSelect.value === "custom") {
                selectEditDiv.classList.remove("d-none");
            } else {
                selectEditDiv.classList.add("d-none");
            }
        });
    }

    /**
     * Fills the edit modal input fields when an event is clicked on to be edited.
     *
     * @author Tim Knops
     */
    #fillEditModalInputFields() {
        const editEventTitle = this.#calendarView.querySelector("#edit-event-title");
        editEventTitle.value = this.#selectedEvent.event._def.title;
    }

    /**
     * Handles everything related to the editing modal.
     *
     * @author Tim Knops
     */
    #handleEditEventModal() {
        this.#editModal = new bootstrap.Modal(this.#calendarView.querySelector("#edit-event-modal"));

        const saveButton = this.#calendarView.querySelector("#edit-event-save");
        const deleteButton = this.#calendarView.querySelector(".fa-trash");
        const select = this.#calendarView.querySelector(".edit-event-title-select");

        this.#editModal._element.addEventListener("hide.bs.modal", () => {
            this.#selectedEvent.view.calendar.unselect();
        });

        saveButton.addEventListener("click", () => {
            let title = select.value;

            if (select.value === "custom") {
                title = this.#calendarView.querySelector("#edit-event-title").value;
                this.#selectedEvent.event.setProp("title", title);

                this.#selectedEvent.event.setExtendedProp("custom", true);
            } else {
                this.#selectedEvent.event.setProp("title", title);
                this.#selectedEvent.event.setExtendedProp("custom", null);
            }

            this.#updateSideBarEvents(this.#calendar.getEvents(),false);
            this.#editModal.hide();
        });

        deleteButton.addEventListener("click", () => {
            this.#selectedEvent.event.remove();
            this.#updateSideBarEvents(this.#calendar.getEvents(),false);

            this.#editModal.hide();
        });
    }

    /**
     * Changes the view of the select, depending on if the title was custom or not.
     *
     * @author Tim Knops
     */
    #handleEditEventCustomTitleSelect() {
        const eventObj = this.#selectedEvent.event.toPlainObject();
        const customTitleDiv = this.#calendarView.querySelector(".edit-custom-title-div");
        const select = this.#calendarView.querySelector(".edit-event-title-select");


        if (eventObj.extendedProps.custom !== null) { // If the title is custom.
            customTitleDiv.classList.remove("d-none");

            select.value = "custom";
        } else {
            customTitleDiv.classList.add("d-none");

            select.value = eventObj.title;
        }
    }

     async #addUserActivitiesToSelect() {
        const chosenActivities = await this.#calendarRepository.getChosenActivities(this.#userId);
        const selectOptionTemplate = this.#calendarView.querySelector("#select-option-template");
        const selectDiv = this.#calendarView.querySelector(".event-title-select");
        const selectEditDiv = this.#calendarView.querySelector(".edit-event-title-select")

        chosenActivities.forEach((activity) => {
            let selectOptionTemplateClone = selectOptionTemplate.content.cloneNode(true);

            selectOptionTemplateClone.firstElementChild.value = activity.activity_name;
            selectOptionTemplateClone.firstElementChild.innerHTML = activity.activity_name;

            selectDiv.appendChild(selectOptionTemplateClone);

            selectOptionTemplateClone = selectOptionTemplate.content.cloneNode(true);

            selectOptionTemplateClone.firstElementChild.value = activity.activity_name;
            selectOptionTemplateClone.firstElementChild.innerHTML = activity.activity_name;

            selectEditDiv.appendChild(selectOptionTemplateClone);
        });

         let selectOptionTemplateClone = selectOptionTemplate.content.cloneNode(true);
         selectOptionTemplateClone.firstElementChild.value = "custom";
         selectOptionTemplateClone.firstElementChild.innerHTML = "Anders, namelijk:";

         selectDiv.appendChild(selectOptionTemplateClone);

         selectOptionTemplateClone = selectOptionTemplate.content.cloneNode(true);
         selectOptionTemplateClone.firstElementChild.value = "custom";
         selectOptionTemplateClone.firstElementChild.innerHTML = "Anders, namelijk:";

         selectEditDiv.appendChild(selectOptionTemplateClone);
     }
}