import {SaveData, Race} from "../RaceDayDataSave.js";
import {addData, initAddRaceMenu} from "../AddRaceMenu.js";
import {initAddCalendarMenu} from "../addCalendarMenu.js";

class CurrentMonthYearObservable {
    constructor() {
        this.year = new Date().getFullYear();
        this.month = new Date().getMonth() + 1; // JS maanden zijn 0-based
        this.listeners = [];
    }

    setMonthYear(year, month) {
        this.year = year;
        this.month = month;
        this.invalidate();
    }

    nextMonth() {
        if (this.month === 12) {
            this.month = 1;
            this.year++;
        } else {
            this.month++;
        }
        this.invalidate();
    }

    prevMonth() {
        if (this.month === 1) {
            this.month = 12;
            this.year--;
        } else {
            this.month--;
        }
        this.invalidate();
    }

    getYear() {
        return this.year;
    }

    getMonth() {
        return this.month;
    }

    addListener(listener) {
        this.listeners.push(listener);
    }

    invalidate() {
        for (let listener of this.listeners) {
            listener(this.year, this.month); // gewoon de functie aanroepen
        }
    }

}

const saveData = new SaveData();
/**
 * Om de maand bij het opstarten te laden die zijn gebonden aan de dag van vandaag.
 */
let yearMonthObservable = new CurrentMonthYearObservable();
const standardMenuView =
    `<Button
                id="change_calander_view_button"
                class="change_calander_view_button"
                onclick="window.location.href='ListviewPage.html'"
        >List view calendar</Button>
        <span class="infoSpan">
            To add a race you need to click on the add race button.
            In order to add a race you need to have added a race calendar with the add calendar button.
            You can add multiple races to one calendar and you can add the same race to different calendars.
        </span>
        <Button id="addButton" class="addButton" onclick="clickAddRace()" >Add race</Button>
        <Button id="addCalendarButton" class="addButton" onclick="clickAddCalendar()">Add calendar</Button>`

initAddRaceMenu({saveData, standardMenuView});
initAddCalendarMenu({saveData, standardMenuView});


const months = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December"
]
const daysInMonth = {
    "January": 31,
    "February": 28,
    "March": 31,
    "April": 30,
    "May": 31,
    "June": 30,
    "July": 31,
    "August": 31,
    "September": 30,
    "October": 31,
    "November": 30,
    "December": 31
}

const weekDays = [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday"
]


async function start() {
    await loadMonth(yearMonthObservable.getYear(), yearMonthObservable.getMonth());
    document.getElementById("nextButton").addEventListener("click", () => {
        yearMonthObservable.nextMonth();
    });
    document.getElementById("prevButton").addEventListener("click", () => {
        yearMonthObservable.prevMonth();
    });

    yearMonthObservable.addListener(async (year, month) => {
        document.getElementById("days_list").innerHTML = "";
        await loadMonth(year, month);
    });
}

window.start = start;

/*
 * Hier moet worden het nummer (1-12) worden meegegeven die staan voor resp. maand en jaar,
 * waarvoor de maand layout moet worden berekend.
 */
async function loadMonth(yearNumber, monthNumber) {
    const loadingDiv = document.getElementById("loading_screen");
    loadingDiv.style.visibility = "visible";
    document.getElementById("days_list").innerHTML = "";


    function getAmountOfDays (year, month) {
        return new Date(year, month, 0).getDate();
    }
    function getStartDay(year, month) {
        return new Date(year, (month - 1) % 12, 1).getDay();
    }

    async function createView(dayNumber, month, year, racesByDate) {
        const el = document.createElement("li");
        el.textContent = dayNumber;

        const key = new Date(year, month - 1, dayNumber).toDateString();
        const racesForDay = racesByDate[key] || [];

        for (const race of racesForDay) {
            const raceViewCalendar = createRaceView(race);
            el.appendChild(raceViewCalendar);
        }

        return el;
    }


    function createRaceView(race) {
        const outsideDiv = document.createElement("div");
        const insideDiv = document.createElement("div");
        const delButton = document.createElement("button");
        delButton.textContent = 'x';
        delButton.classList.add("race_calendar_del_button");

        outsideDiv.classList.add("race_calendar_view");
        outsideDiv.style.backgroundColor = race.color;
        outsideDiv.onclick = function () {
            clickAddRace();
            addData(race);
        }

        const span = document.createElement("span");
        span.textContent = race.name;

        insideDiv.appendChild(span);
        outsideDiv.appendChild(insideDiv);
        outsideDiv.appendChild(delButton);

        delButton.addEventListener("click", async function () {
            await saveData.removeRace(race);
        })

        return outsideDiv;
    }

    function groupRacesByDate(races) {
        const map = {};
        for (const race of races) {
            const key = race.date.toDateString();
            if (!map[key]) map[key] = [];
            map[key].push(race);
        }
        return map;
    }


    const amountOfDays = getAmountOfDays(yearNumber, monthNumber);
    const startDay = getStartDay(yearNumber, monthNumber);
    const prevMonthYear = (monthNumber === 1) ? yearNumber - 1 : yearNumber;
    const prevMonth = (monthNumber === 1) ? 12 : monthNumber - 1;
    const daysPrevMonth = getAmountOfDays(prevMonthYear, prevMonth);
    const races = await saveData.getRacesFromToDate(
        new Date(prevMonthYear, prevMonth - 1, daysPrevMonth - startDay + 1),
        new Date(yearNumber, monthNumber, amountOfDays)
    );

    const racesByDate = groupRacesByDate(races);

    document.getElementById("month_name").innerHTML = `${months[monthNumber - 1]} ${yearNumber}` ;

    for (let i = daysPrevMonth - startDay + 2; i < daysPrevMonth + 1; i++) {

        const view = await createView(i, prevMonth, prevMonthYear, racesByDate);
        document.getElementById("days_list").append(view);
    }

    for (let i = 1; i < amountOfDays + 1; i++) {
        const view = await createView(i, monthNumber, yearNumber, racesByDate);
        document.getElementById("days_list").append(view);
    }

    loadingDiv.style.visibility = "hidden";
}

saveData.addRaceListener(async () => await loadMonth(yearMonthObservable.getYear(), yearMonthObservable.getMonth()));

export {saveData, standardMenuView};