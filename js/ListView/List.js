import {SaveData, Race} from "../RaceDayDataSave.js";
const saveData = new SaveData();

async function start() {
    const startDateInput = document.getElementById("date_start_input");
    const endDateInput = document.getElementById("date_end_input");

    const now = new Date();
    const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0);

    startDateInput.value = firstDay.toISOString().split("T")[0];
    endDateInput.value = lastDay.toISOString().split("T")[0];
}

async function handleChangeDateInput() {
    const startDateInput = document.getElementById("date_start_input");
    const endDateInput = document.getElementById("date_end_input");

    if (startDateInput.value !== "" && endDateInput.value !== "") {

        document.getElementById("race_list").innerHTML ="";
        const start = new Date(startDateInput.value);
        const end = new Date(endDateInput.value);

        const races = await saveData.getRacesFromToDate(start, end);

        for (let race of races.sort((a, b) => a.date - b.date)) {
            addRaceToList(race);
        }
    }
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

    // Append columns into row
    li.appendChild(dateCol);
    li.appendChild(nameCol);
    li.appendChild(distCol);
    li.appendChild(travelCol);

    // Add row to list
    document.getElementById("race_list").appendChild(li);
}


window.handleChangeDateInput = handleChangeDateInput;
window.start = start;