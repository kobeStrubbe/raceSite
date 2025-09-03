import {SaveData, Race} from "../RaceDayDataSave.js";
import {addData, initAddRaceMenu} from "../AddRaceMenu.js";
import {initAddCalendarMenu} from "../addCalendarMenu.js";

const saveData = new SaveData();
const standardMenuView =
    `<Button
                    id="change_calander_view_button"
                    class="change_calander_view_button"
                    onclick="window.location.href='Calendar.html'"
            >Calendar view</Button>
    <span class="infoSpan">
            To add a race you need to click on the add race button.
            In order to add a race you need to have added a race calendar with the add calendar button.
            You can add multiple races to one calendar and you can add the same race to different calendars.
    </span>
    <Button class="addButton" onclick="clickAddRace()" >Add race</Button>
    <Button class="addButton" onclick="clickAddCalendar()">Add calendar</Button>
`

initAddRaceMenu({saveData, standardMenuView});
initAddCalendarMenu({saveData, standardMenuView});

async function start() {
    const startDateInput = document.getElementById("date_start_input");
    const endDateInput = document.getElementById("date_end_input");

    const now = new Date();
    const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0);

    startDateInput.value = firstDay.toISOString().split("T")[0];
    endDateInput.value = lastDay.toISOString().split("T")[0];

    handleChangeDateInput();
}

async function handleChangeDateInput() {
    const loadingScreen = document.getElementById("loading_screen");
    loadingScreen.style.visibility = "visible";

    const startDateInput = document.getElementById("date_start_input");
    const endDateInput = document.getElementById("date_end_input");
    document.getElementById("race_list").innerHTML = "";

    if (startDateInput.value !== "" && endDateInput.value !== "") {

        const start = new Date(startDateInput.value);
        const end = new Date(endDateInput.value);

        const races = await saveData.getRacesFromToDate(start, end);

        for (let race of races.sort((a, b) => a.date - b.date)) {
            addRaceToList(race);
        }
    }

    loadingScreen.style.visibility = "hidden";
}

function addRaceToList(race) {
    const li = document.createElement("li");
    li.classList.add("race_row");

    // Date column
    const dateCol = document.createElement("div");
    dateCol.classList.add("race_col");
    dateCol.textContent = race.date instanceof Date
        ? race.date.toISOString().split("T")[0]
        : race.date;

    // Name column
    const nameCol = document.createElement("div");
    nameCol.classList.add("race_col");
    nameCol.textContent = race.name;

    // Distance column
    const distCol = document.createElement("div");
    distCol.classList.add("race_col");
    distCol.textContent = `${race.distance} m`;

    // Travel time column
    const travelCol = document.createElement("div");
    travelCol.classList.add("race_col");
    travelCol.textContent = race.travelTime + " min";

    const optionsCol = document.createElement("div");
    optionsCol.classList.add("race_col");
    optionsCol.classList.add("options_col_div");

    const editButton = document.createElement("button");
    editButton.textContent = "Edit";
    editButton.addEventListener("click", () => {
        clickAddRace();
        addData(race);
    })
    const deleteButton = document.createElement("button");
    deleteButton.textContent = "X";
    deleteButton.addEventListener("click", () => {
        saveData.removeRace(race);
    })
    optionsCol.appendChild(deleteButton);
    optionsCol.appendChild(editButton);

    // Append columns into row
    li.appendChild(dateCol);
    li.appendChild(nameCol);
    li.appendChild(distCol);
    li.appendChild(travelCol);
    li.appendChild(optionsCol);

    // Add row to list
    document.getElementById("race_list").appendChild(li);
}

saveData.addRaceListener( async () => await handleChangeDateInput())

window.handleChangeDateInput = handleChangeDateInput;
window.start = start;

export {saveData};